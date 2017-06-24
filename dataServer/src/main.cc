#include "httplib.h"
#include <iostream>
#include <fstream>
#include <string>
#include <stdlib.h>
#include <signal.h>

// #define START_LOCAL_SERVER
using namespace std;

httplib::Server serv;
ofstream banf;

void usage() {
	cout << "Invalid arguments! Usage:\n"
	<< "./dataServer <port>\n";
}
void onSignal(int signo) {
	if (signo == SIGINT) {
		cout << "Closing file and exiting...\n";
		banf.close();
		exit(0);
	}
}
int main(int argc, char** argv) {
	int port = 8283;
	if (argc != 2) {
		usage();
		return 0;
	} else {
		port = atoi(argv[1]);
		if (port == 0) {
			cout << "Invalid port!\n";
			usage();
			return 0;
		}
	}
	banf.open("./bans", ios_base::app);
	if (signal(SIGINT, onSignal) == SIG_ERR) {
		cout << "WARN: Failed to register SIGINT event\n";
	}
	serv.post("/baninfo", [](const httplib::Request& req, httplib::Response& res) {
		res.set_header("Access-Control-Allow-Origin", "*");
		cout << "Recieved banInfo POST\n";
		// Really basic string checking to prevent basic data corruption
		size_t index;
		index = req.body.find("\0");
		if (index == string::npos || index == 0) {
			index = req.body.find("{");
			if (index != string::npos) {
				// The request is valid enough, append to the file
				cout << "Writing accepted request\n";
				banf << req.body << "\0";
				res.set_content("SUCCESS", "text/plain");
			} else {
				cout << "Rejecting invalid request: no brackets.\n";
				res.status = 400;
				res.set_content("Invalid request.", "text/plain");
			}
		} else {
			cout << "Rejecting invalid request: detected null byte.\n";
			res.status = 400;
			res.set_content("Invalid request.", "text/plain");
		}
	});
	serv.get("/baninfo", [](const httplib::Request& req, httplib::Response& res) {
		// Reject GETs
		cout << "Recieved banInfo GET, rejecting it.\n";
		res.status = 400;
		res.set_content("Invalid request method.", "text/plain");
	});
	cout << "Starting HTTP server on port " << port << ", ";
	#ifdef START_LOCAL_SERVER
		cout << "listening locally\n";
		serv.listen("127.0.0.1", port);
	#else
		cout << "listening externally\n";
		serv.listen("204.44.91.137", port);
	#endif
	return 0;
}