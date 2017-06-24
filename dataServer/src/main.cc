#include "httplib.h"
#include <iostream>
#include <string>
#include <stdlib.h>

#define START_LOCAL_SERVER
using namespace std;

httplib::Server serv;
ofstream banf;

void usage() {
	cout << "Invalid arguments! Usage:\n"
	<< "./dataServer <port>\n";
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
	banf.open("./bans");
	serv.post("/baninfo", [](const httplib::Request& req, httplib::Response& res) {
		cout << "Recieved banInfo POST\n";
		// TODO: Handle incoming ban data.
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