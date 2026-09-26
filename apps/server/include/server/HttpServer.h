#ifndef HTTP_SERVER_H
#define HTTP_SERVER_H

#include <string>

#include "third_party/httplib.h"

class HttpServer {
private:
    httplib::Server server_;
    int port_;
    std::string webRoot_;
    std::string settingsPath_;

    void setupCors();
    void setupRoutes();

public:
    explicit HttpServer(int port = 8080,
                        std::string webRoot = "./apps/web",
                        std::string settingsPath = "./data/settings.json");

    void start();
    void stop();
    int getPort() const;
};

#endif
