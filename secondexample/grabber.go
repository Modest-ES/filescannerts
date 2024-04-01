package main

import (
	"flag"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"time"
)

// handleURL - обрабатывает запрос по url
func handleURL(line string, wg *sync.WaitGroup, dstPtr *string) {
	defer wg.Done()
	body, status := readHTMLData(line)
	if status {
		index := strings.IndexRune(line, '.')
		if index != -1 {
			line = line[:index]
		}

		err := createHTMLFile(line, *dstPtr, string(body))
		if err != nil {
			log.Fatal(err)
		}
	}
}

// readHTMLData - отправляет запрос по URL и возвращает считанные данные и статус валидности
func readHTMLData(urlname string) (string, bool) {
	resp, err := http.Get(fmt.Sprintf("https://%s", urlname))
	if err != nil {
		fmt.Printf("ER %s\r\n", urlname)
		return "", false
	}
	defer resp.Body.Close()
	fmt.Printf("OK %s\r\n", urlname)
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Fatal(err)
	}
	return string(body), true
}

// createHTMLFile - создает HTML-файл в указанной директории
func createHTMLFile(filename, directory, content string) error {
	_, err := os.Stat(directory)
	if os.IsNotExist(err) {
		err := os.Mkdir(directory, 0755)
		if err != nil {
			log.Fatal(err)
		}
	}
	filePath := filepath.Join(directory, filename)
	file, err := os.Create(filePath)
	if err != nil {
		return err
	}
	defer file.Close()

	_, err = file.WriteString(content)
	if err != nil {
		return err
	}

	return nil
}

func main() {
	var srcPtr = flag.String("src", "nodata", "the url file source")
	var dstPtr = flag.String("dst", "./defaultdir", "the destination directory")
	flag.Parse()

	if *srcPtr == "nodata" {
		log.Fatal("Error: Missing source flag value. Add it using --src=<file path>")
	}
	if *dstPtr == "./defaultdir" {
		fmt.Println("Warning: Destination flag value is not entered. The defaultdir directory is used for storing the results")
	}

	fmt.Println("src value: ", *srcPtr)
	fmt.Println("destination value: ", *dstPtr)
	startingMoment := time.Now()

	file, err := os.Open(*srcPtr)
	if err != nil {
		log.Fatal(err)
	}
	defer file.Close()

	urldata, err := io.ReadAll(file)
	if err != nil {
		log.Fatal(err)
	}
	lines := strings.Split(string(urldata), "\n")

	var wg sync.WaitGroup
	wg.Add(len(lines))

	for _, line := range lines {
		go handleURL(line, &wg, dstPtr)
	}
	wg.Wait()
	endingMoment := time.Now()

	fmt.Println("duration: ", endingMoment.Sub(startingMoment))
}
