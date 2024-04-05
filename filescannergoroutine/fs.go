package main

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"os/signal"
	"path/filepath"
	"sort"
	"sync"
	"syscall"
	"time"
)

// Config содержит конфигурацию запускаемого сервера
type Config struct {
	Port int64
}

// FileScannerData описывает структуру выполнения программы
type FileScannerData struct {
	RootPath     string // адрес директории считывания файлов
	Duration     string // длительность выполнения программы
	FilesList    []File // список файлов и папок с их размерами
	Status       int    // поле, равное 0 при отсутствии ошибок работы программы, или 1 при их наличии
	ErrorMessage string // текст ошибки при ее наличии
}

// File описывает структуру файла из директории
type File struct {
	FileName       string // название файла
	FileSize       int64  // размер файла в битах
	FileSizeString string // размер файла в строковом формате
	FileType       string // тип: папка или файл
}

// String возвращает строку со всеми значениями параметров структуры File
func (file File) String() string {
	return fmt.Sprintf("%-7s %-30s %s", file.FileType, file.FileName, fileSizeToString(file.FileSize))
}

// FileArray - массив структур File - вспомогательный тип для настройки сортировки структур File по полю FileSize
type FileArray []File

// Len возвращает длину массива структур File
func (files FileArray) Len() int {
	return len(files)
}

// Swap меняет местами два элемента массива структур File
func (files FileArray) Swap(i, j int) {
	files[i], files[j] = files[j], files[i]
}

// Less сравнивает значения полей FileSize у двух элементов массива структур File и возвращает true если у первого элемента значение меньше, чем у второго
func (files FileArray) Less(i, j int) bool {
	return files[i].FileSize < files[j].FileSize
}

// getRootData считывает содержимое директории и возвращает его в виде массива структур File
func getRootData(rootpath string) ([]File, error) {
	fileEntries, err := os.ReadDir(rootpath)
	if err != nil {
		return nil, err
	}
	var files []File
	var wg sync.WaitGroup

	for _, fileEntry := range fileEntries {
		path := filepath.Join(rootpath, fileEntry.Name())
		fileInfo, err := os.Stat(path)
		if err != nil {
			return nil, err
		}

		if fileInfo.IsDir() {
			wg.Add(1)
			go func(directoryPath string) {
				defer wg.Done()
				size, err := calculateFolderSize(directoryPath)
				if err != nil {
					log.Fatal(err)
				}
				files = append(files, File{FileName: fileInfo.Name(), FileSize: size, FileSizeString: fileSizeToString(size), FileType: "folder"})
			}(path)

		} else {
			files = append(files, File{FileName: fileInfo.Name(), FileSize: fileInfo.Size(), FileSizeString: fileSizeToString(fileInfo.Size()), FileType: "file"})
		}
	}
	wg.Wait()
	return files, nil
}

// calculateFolderSize возвращает размер папки по указанному пути
func calculateFolderSize(path string) (int64, error) {
	var size int64
	_ = filepath.Walk(path, func(subpath string, info os.FileInfo, err error) error {
		if err != nil {
			log.Fatal(err)
		}
		size += info.Size()
		return nil
	})
	return size, nil
}

// fileSizeToString возвращает строку с размером файла в соответствующем формате (B/kB/MB/GB/TB)
func fileSizeToString(size int64) string {
	const (
		KB = 1 << 10
		MB = 1 << 20
		GB = 1 << 30
		TB = 1 << 40
	)

	switch {
	case size < KB:
		return fmt.Sprintf("%d B", size)
	case size < MB:
		return fmt.Sprintf("%.2f kB", float64(size)/float64(KB))
	case size < GB:
		return fmt.Sprintf("%.2f MB", float64(size)/float64(MB))
	case size < TB:
		return fmt.Sprintf("%.2f GB", float64(size)/float64(GB))
	default:
		return fmt.Sprintf("%.2f TB", float64(size)/float64(TB))
	}
}

// writeJsonData
func writeJsonData(fileScannerData FileScannerData, respWriter http.ResponseWriter) {
	jsonData, err := json.Marshal(fileScannerData)
	if err != nil {
		http.Error(respWriter, err.Error(), http.StatusInternalServerError)
		return
	}

	respWriter.Header().Set("Content-Type", "application/json")
	respWriter.Write(jsonData)
}

// handleRequest обрабатывает запрос на http-сервер, вызывает чтение данных из указанной директории, сортирует и выводит прочитанную информацию в формате json
func handleRequest(respWriter http.ResponseWriter, request *http.Request) {
	startingMoment := time.Now()
	root := request.URL.Query().Get("root")
	if root == "" {
		duration := time.Since(startingMoment).String()
		fileScannerData := FileScannerData{
			RootPath:     root,
			Duration:     duration,
			FilesList:    []File{},
			Status:       1,
			ErrorMessage: "The value of root parameter is not provided. Use '/?root=<path>' to enter the path to the root directory",
		}
		writeJsonData(fileScannerData, respWriter)
		return
	}

	files, err := getRootData(root)
	if err != nil {
		duration := time.Since(startingMoment).String()
		fileScannerData := FileScannerData{
			RootPath:     root,
			Duration:     duration,
			FilesList:    []File{},
			Status:       1,
			ErrorMessage: err.Error(),
		}
		writeJsonData(fileScannerData, respWriter)
		return
	}

	sortMode := request.URL.Query().Get("sort")
	if sortMode == "asc" || sortMode == "" {
		sort.Sort(FileArray(files))
	} else if sortMode == "desc" {
		sort.Sort(sort.Reverse(FileArray(files)))
	} else {
		duration := time.Since(startingMoment).String()
		fileScannerData := FileScannerData{
			RootPath:     root,
			Duration:     duration,
			FilesList:    []File{},
			Status:       1,
			ErrorMessage: "The sort parameter value is incorrect. Use either sort=asc or sort=desc",
		}
		writeJsonData(fileScannerData, respWriter)
		return
	}

	duration := time.Since(startingMoment).String()

	fileScannerData := FileScannerData{
		RootPath:     root,
		Duration:     duration,
		FilesList:    files,
		Status:       0,
		ErrorMessage: "",
	}
	writeJsonData(fileScannerData, respWriter)
}

func main() {
	fmt.Println("Program started")

	configFile, err := os.Open("config.json")
	if err != nil {
		log.Fatal(err)
	}
	defer configFile.Close()

	byteValueConfig, err := io.ReadAll(configFile)
	if err != nil {
		log.Fatal(err)
	}

	var config Config
	if err := json.Unmarshal(byteValueConfig, &config); err != nil {
		log.Fatal(err)
	}

	http.HandleFunc("/", handleRequest)

	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
	go func() {
		for sig := range sigChan {
			switch sig {
			case syscall.SIGINT:
				fmt.Println("Signal Interrupt (SIGINT) encountered. Shutting down")
				os.Exit(0)
			case syscall.SIGTERM:
				fmt.Println("Signal Terminate (SIGTERM) encountered. Shutting down")
				os.Exit(0)
			}
		}
	}()

	log.Printf("Starting a server on port %d", config.Port)
	log.Fatal(http.ListenAndServe(fmt.Sprintf(":%d", config.Port), nil))
}
