PATH  := node_modules/.bin:$(PATH)
SHELL := /bin/bash

.PHONY: all test lint

all: test lint

test: node_modules
	jasmine

lint: node_modules
	jshint . --exclude-path .gitignore

node_modules:
	yarn
