package main

import (
	"bytes"
	"context"
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

// Config содержит конфигурацию запускаемого сервера
type Config struct {
	Port int64
}

// readConfigFile возвращает считанную информацию из файла конфигурации
func readConfigFile() (Config, error) {
	configFile, err := os.Open("config.json")
	if err != nil {
		return Config{}, err
	}
	defer configFile.Close()

	byteValueConfig, err := io.ReadAll(configFile)
	if err != nil {
		return Config{}, err
	}

	var config Config

	err = json.Unmarshal(byteValueConfig, &config)
	if err != nil {
		return Config{}, err
	}
	return config, nil
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
			ErrorMessage: "Отсутствует значение параметра root. Используйте '/?root=<путь>' для указания пути директории",
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
			ErrorMessage: "Значение параметра sort неверно. Используйте sort=asc (по возрастанию) или sort=desc (по убыванию)",
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

	jsonData, err := json.Marshal(fileScannerData)
	if err != nil {
		http.Error(respWriter, err.Error(), http.StatusInternalServerError)
		return
	}

	// Send the POST request to localhost:80/receive.php
	go sendPostRequest(jsonData)

	writeJsonData(fileScannerData, respWriter)
}

// sendPostRequest отправляет POST request с данными в Json на сервер Apache с PHP-интерпретатором
func sendPostRequest(jsonData []byte) {
	var data FileScannerData
	err := json.Unmarshal(jsonData, &data)
	if err != nil {
		fmt.Println("Ошибка анмаршаллинга JSON:", err)
		return
	}
	url := "http://localhost:80/dbadd.php"
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		log.Printf("Ошибка создания POST запроса: %v", err)
		return
	}
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		log.Printf("Ошибка отправки POST запроса: %v", err)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		log.Printf("POST запрос отправлен с ошибкой: %s\n", resp.Status)
	}
}

// handleFrontendDataRequest отображает фронтенд-часть приложения
// func handleFrontendDataRequest(respWriter http.ResponseWriter, request *http.Request) {
// 	http.ServeFile(respWriter, request, "./ui/index.html")
// }

func main() {
	fmt.Println("Начало работы")

	config, err := readConfigFile()
	if err != nil {
		log.Fatal(err)
	}

	mux := http.NewServeMux()
	staticFilesFolder := http.Dir("./public")
	staticFilesServer := http.FileServer(staticFilesFolder)
	mux.Handle("/", staticFilesServer)
	mux.HandleFunc("/files", handleJsonDataRequest)

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
	go func() {
		sig := <-sigChan
		switch sig {
		case syscall.SIGINT:
			fmt.Println("Уловлен сигнал прерывания (SIGINT). Выключение сервера")
			cancel()
		case syscall.SIGTERM:
			fmt.Println("Уловлен сигнал прекращения (SIGTERM). Выключение сервера")
			cancel()
		}
	}()

	server := &http.Server{
		Addr:    fmt.Sprintf(":%d", config.Port),
		Handler: mux,
	}

	go func() {
		log.Printf("Запуск сервера на порте: %d", config.Port)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Ошибка запуска сервера: %v", err)
		}
	}()

	<-ctx.Done()

	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer shutdownCancel()

	if err := server.Shutdown(shutdownCtx); err != nil {
		log.Fatalf("Ошибка выключения сервера: %v", err)
	}

	log.Println("Выключение сервера завершено")
}
