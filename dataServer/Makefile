SRC=$(wildcard src/*.cpp src/*.cc)
OUT=./out
CC=clang++
OPTS=-pthread -lpthread -std=c++11 -lssl -ggdb
PORT=8283
THISF := $(lastword $(MAKEFILE_LIST))))

default:
	$(CC) $(SRC) $(OPTS) -o $(OUT)
debug:
	make default
	echo "Starting GDB...\n"
	gdb $(OUT)
clean:
	rm -f $(OUT)
run:
	make default
	$(OUT) $(PORT)