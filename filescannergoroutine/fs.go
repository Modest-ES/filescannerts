package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"sort"
	"sync"
	"time"
)

// File описывает структуру файла из директории
type File struct {
	FileName string // название файла
	FileSize int64  // размер файла в битах
	FileType string // тип: папка или файл
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
				files = append(files, File{FileName: fileInfo.Name(), FileSize: size, FileType: "folder"})
			}(path)

		} else {
			files = append(files, File{FileName: fileInfo.Name(), FileSize: fileInfo.Size(), FileType: "file"})
		}
	}
	wg.Wait()
	return files, nil
}

// calculateFolderSize возвращает размер папки по указанному пути
func calculateFolderSize(path string) (int64, error) {
	var size int64
	var wg sync.WaitGroup
	var mu sync.Mutex
	_ = filepath.Walk(path, func(subpath string, info os.FileInfo, err error) error {
		if err != nil {
			log.Fatal(err)
		}
		wg.Add(1)
		go func(info os.FileInfo) {
			defer wg.Done()
			mu.Lock()
			defer mu.Unlock()
			size += info.Size()
		}(info)

		return nil
	})
	wg.Wait()
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

// handleRequest обрабатывает запрос на http-сервер, вызывает чтение данных из указанной директории, сортирует и выводит прочитанную информацию в формате json
func handleRequest(respWriter http.ResponseWriter, request *http.Request) {
	startingMoment := time.Now()
	root := request.URL.Query().Get("root")
	if root == "" {
		http.Error(respWriter, "the 'root' parameter value was not provided", http.StatusBadRequest)
		return
	}

	files, err := getRootData(root)
	if err != nil {
		log.Fatal(err)
	}

	sortMode := request.URL.Query().Get("sort")
	if sortMode == "asc" || sortMode == "" {
		sort.Sort(FileArray(files))
	} else if sortMode == "desc" {
		sort.Sort(sort.Reverse(FileArray(files)))
	} else {
		log.Fatal("Error: incorrect value for sort parameter. Use either sort=asc or sort=desc")
	}

	jsonData, err := json.Marshal(files)
	if err != nil {
		http.Error(respWriter, err.Error(), http.StatusInternalServerError)
		return
	}

	respWriter.Header().Set("Content-Type", "application/json")
	respWriter.Write(jsonData)
	endingMoment := time.Now()

	fmt.Println("---\nduration: ", endingMoment.Sub(startingMoment))
}

func main() {
	http.HandleFunc("/", handleRequest)
	log.Println("Starting a server on port 9000")
	log.Fatal(http.ListenAndServe(":9000", nil))
}
