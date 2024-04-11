package directoryreader

import (
	"fmt"
	"log"
	"os"
	"path/filepath"
	"sync"
)

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
func GetRootData(rootpath string) ([]File, error) {
	fileEntries, err := os.ReadDir(rootpath)
	if err != nil {
		return nil, err
	}
	var files []File
	var wg sync.WaitGroup
	var mu sync.Mutex

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
				mu.Lock()
				defer mu.Unlock()
				files = append(files, File{FileName: fileInfo.Name(), FileSize: size, FileSizeString: fileSizeToString(size), FileType: "Folder"})
			}(path)

		} else {
			files = append(files, File{FileName: fileInfo.Name(), FileSize: fileInfo.Size(), FileSizeString: fileSizeToString(fileInfo.Size()), FileType: "File"})
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
