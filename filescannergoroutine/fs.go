package main

import (
	"flag"
	"fmt"
	"log"
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

func main() {
	rootPtr := flag.String("root", "nodata", "the root directory")
	sortPtr := flag.String("sort", "asc", "the sorting option")
	flag.Parse()

	if *rootPtr == "nodata" {
		log.Fatal("Error: Missing root flag value. Add it using --root=<path>")
	}

	fmt.Println("root value: ", *rootPtr)
	fmt.Println("sort value: ", *sortPtr)

	startingMoment := time.Now()
	files, err := getRootData(*rootPtr)
	if err != nil {
		log.Fatal(err)
	}

	if *sortPtr == "asc" {
		sort.Sort(FileArray(files))
	} else if *sortPtr == "desc" {
		sort.Sort(sort.Reverse(FileArray(files)))
	} else {
		log.Fatal("Error: incorrect value for --sort flag. Use either --sort=asc or --sort=desc")
	}

	fmt.Println("root directory content:\n---")
	for _, file := range files {
		fmt.Println(file)
	}

	endingMoment := time.Now()

	fmt.Println("---\nduration: ", endingMoment.Sub(startingMoment))
}
