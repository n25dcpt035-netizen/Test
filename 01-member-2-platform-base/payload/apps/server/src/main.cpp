#ifdef _WIN32
#define WIN32_LEAN_AND_MEAN
#include <windows.h>
#endif

#include <iostream>

#include "server/HttpServer.h"

int main() {
#ifdef _WIN32
    SetConsoleOutputCP(CP_UTF8);
    SetConsoleCP(CP_UTF8);
#endif

    std::cout << "[INIT] VocabMaster platform is starting...\n";
    HttpServer server(8080, "./runtime/web", "./data/settings.json");
    server.start();
    return 0;
}
