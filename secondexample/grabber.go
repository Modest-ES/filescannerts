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

var srcPtr = flag.String("src", "nodata", "the url file source")
var destinationPtr = flag.String("destination", "/home/artem/Documents/rbs-prac/secondexample/defaultdir", "the destination directory")

func isValidURL(url string) bool {
	resp, err := http.Head(url)
	if err != nil {
		return false
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return false
	}
	return true
}

func createHTMLFile(filename, directory, content string) error {
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

func handleURL(line string, results chan<- string, wg *sync.WaitGroup) {
	defer wg.Done()
	if isValidURL("https://"+line) == true {
		resp, err := http.Get("https://" + line)
		if err != nil {
			fmt.Println("ERROR", line)
		}
		defer resp.Body.Close()
		results <- "OK " + line
		body, err := io.ReadAll(resp.Body)
		if err != nil {
			log.Fatal(err)
		}

		index := strings.IndexRune(line, '.')

		if index != -1 {
			line = line[:index]
		}

		createHTMLFile(line, *destinationPtr, string(body))
	} else {
		results <- "ER " + line
	}
}

func main() {

	flag.Parse()

	if *srcPtr == "nodata" {
		log.Fatal("Error: Source flag value is not entered")
	}
	if *destinationPtr == "/home/artem/Documents/rbs-prac/secondexample/defaultdir" {
		fmt.Println("Warning: Destination flag value is not entered. The defaultdir directory is used for storing the results")
	}

	startingMoment := time.Now()

	file, err := os.Open(*srcPtr)
	if err != nil {
		log.Fatal(err)
	}
	defer file.Close()

	var urldata []string
	buffer := make([]byte, 1024)

	for {
		n, err := file.Read(buffer)
		if n > 0 {
			str := string(buffer[:n])
			splitLines := strings.Split(str, "\n")
			urldata = append(urldata, splitLines...)
		}
		if err != nil {
			if err.Error() == "EOF" {
				break
			}
			log.Fatal(err)
		}
	}

	fmt.Println("Amount of lines in the URLs file = ", len(urldata))

	var wg sync.WaitGroup
	wg.Add(len(urldata))

	results := make(chan string, len(urldata))

	for _, line := range urldata {
		go handleURL(line, results, &wg)
	}

	go func() {
		wg.Wait()
		close(results)
	}()

	for result := range results {
		fmt.Println(result)
	}

	endingMoment := time.Now()

	fmt.Println("duration: ", endingMoment.Sub(startingMoment))
	fmt.Println("src value: ", *srcPtr)
	fmt.Println("destination value: ", *destinationPtr)

}
