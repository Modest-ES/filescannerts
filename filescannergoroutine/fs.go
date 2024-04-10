package main

import (
	"directoryreader/directoryreader"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"os/signal"
	"sort"
	"syscall"
	"time"
)

var server *http.Server

// Config содержит конфигурацию запускаемого сервера
type Config struct {
	Port int64
}

// readConfigFile возвращает считанную информацию из файла конфигурации
func readConfigFile() Config {
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

	err1 := json.Unmarshal(byteValueConfig, &config)
	if err1 != nil {
		log.Fatal(err1)
	}
	return config
}

// FileScannerData описывает структуру выполнения программы
type FileScannerData struct {
	RootPath     string                 // адрес директории считывания файлов
	Duration     string                 // длительность выполнения программы
	FilesList    []directoryreader.File // список файлов и папок с их размерами
	Status       int                    // поле, равное 0 при отсутствии ошибок работы программы, или 1 при их наличии
	ErrorMessage string                 // текст ошибки при ее наличии
}

// writeJsonData выводит данные в формате Json
func writeJsonData(fileScannerData FileScannerData, respWriter http.ResponseWriter) {
	jsonData, err := json.Marshal(fileScannerData)
	if err != nil {
		http.Error(respWriter, err.Error(), http.StatusInternalServerError)
		return
	}

	respWriter.Header().Set("Content-Type", "application/json")
	respWriter.Write(jsonData)
}

// handleJsonDataRequest обрабатывает запрос на http-сервер, вызывает чтение данных из указанной директории, сортирует и выводит прочитанную информацию в формате json
func handleJsonDataRequest(respWriter http.ResponseWriter, request *http.Request) {
	startingMoment := time.Now()
	root := request.URL.Query().Get("root")
	if root == "" {
		duration := time.Since(startingMoment).String()
		fileScannerData := FileScannerData{
			RootPath:     root,
			Duration:     duration,
			FilesList:    []directoryreader.File{},
			Status:       1,
			ErrorMessage: "The value of root parameter is not provided. Use '/?root=<path>' to enter the path to the root directory",
		}
		writeJsonData(fileScannerData, respWriter)
		return
	}

	files, err := directoryreader.GetRootData(root)
	if err != nil {
		duration := time.Since(startingMoment).String()
		fileScannerData := FileScannerData{
			RootPath:     root,
			Duration:     duration,
			FilesList:    []directoryreader.File{},
			Status:       1,
			ErrorMessage: err.Error(),
		}
		writeJsonData(fileScannerData, respWriter)
		return
	}

	sortMode := request.URL.Query().Get("sort")
	if sortMode == "asc" || sortMode == "" {
		sort.Sort(directoryreader.FileArray(files))
	} else if sortMode == "desc" {
		sort.Sort(sort.Reverse(directoryreader.FileArray(files)))
	} else {
		duration := time.Since(startingMoment).String()
		fileScannerData := FileScannerData{
			RootPath:     root,
			Duration:     duration,
			FilesList:    []directoryreader.File{},
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

// handleFrontendDataRequest
func handleFrontendDataRequest(respWriter http.ResponseWriter, request *http.Request) {
	http.ServeFile(respWriter, request, "./index.html")
}

// setJSContentType
// func setJSContentType(next http.Handler) http.Handler {
// 	return http.HandlerFunc(func(respWriter http.ResponseWriter, request *http.Request) {
// 		if filepath.Ext(request.URL.Path) == ".js" {
// 			respWriter.Header().Set("Content-Type", "text/javascript")
// 		}
// 		next.ServeHTTP(respWriter, request)
// 	})
// }

func main() {
	fmt.Println("Program started")

	config := readConfigFile()

	staticFilesFolder := http.Dir("./ui")
	staticFilesServer := http.FileServer(staticFilesFolder)
	http.Handle("/ui/", http.StripPrefix("/ui/", staticFilesServer))

	http.HandleFunc("/files", handleJsonDataRequest)
	http.HandleFunc("/", handleFrontendDataRequest)

	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
	go func() {
		sig := <-sigChan
		switch sig {
		case syscall.SIGINT:
			fmt.Println("Signal Interrupt (SIGINT) encountered. Shutting down")
			os.Exit(0)
		case syscall.SIGTERM:
			fmt.Println("Signal Terminate (SIGTERM) encountered. Shutting down")
			os.Exit(0)
		}
	}()

	log.Printf("Starting a server on port %d", config.Port)
	log.Fatal(http.ListenAndServe(fmt.Sprintf(":%d", config.Port), nil))
}
