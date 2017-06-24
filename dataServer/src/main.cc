#include "httplib.h"
#include <iostream>
#include <string>

#define START_LOCAL_SERVER
using namespace std;

httplib::Server serv;

int main() {
	cout << "Starting HTTP server, ";
	#ifdef START_LOCAL_SERVER
		cout << "listening locally\n";
		serv.listen("127.0.0.1", 1234);
	#else
		cout << "listening externally\n";
		serv.listen("204.44.91.137", 1234);
	#endif
	return 0;
}