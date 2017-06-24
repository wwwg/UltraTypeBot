SRC=$(wildcard src/*.cpp src/*.cc)
OUT=./out
CC=clang++
OPTS=-pthread -lpthread -std=c++11 -lssl -ggdb
THISF := $(lastword $(MAKEFILE_LIST))))

default:
	$(CC) $(SRC) $(OPTS) -o $(OUT)
debug:
	# For debugging with GDB
	@$(MAKE) -f $(THISF) default
	echo "Starting GDB...\n"
	gdb $(OUT) 8283
clean:
	rm -f $(OUT)
