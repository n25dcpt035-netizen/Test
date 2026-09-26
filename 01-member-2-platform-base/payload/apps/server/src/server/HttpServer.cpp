#include "server/HttpServer.h"

#include <filesystem>
#include <fstream>
#include <iostream>
#include <utility>

#include "third_party/json.hpp"

using json = nlohmann::json;

namespace {
json defaultSettings() {
    return {{"profileName", "Người học"}, {"dailyGoal", 20}, {"soundEnabled", true}};
}

json readJsonFile(const std::string& path, const json& fallback) {
    std::ifstream input(path);
    if (!input) {
        return fallback;
    }
    try {
        return json::parse(input);
    } catch (const std::exception&) {
        return fallback;
    }
}

bool writeJsonFile(const std::string& path, const json& value) {
    const std::filesystem::path destination(path);
    if (destination.has_parent_path()) {
        std::filesystem::create_directories(destination.parent_path());
    }

    const std::string temporary = path + ".tmp";
    {
        std::ofstream output(temporary, std::ios::trunc);
        if (!output) {
            return false;
        }
        output << value.dump(2) << '\n';
    }

    std::error_code error;
    std::filesystem::remove(destination, error);
    error.clear();
    std::filesystem::rename(temporary, destination, error);
    return !error;
}

void sendJson(httplib::Response& response, const json& value, int status = 200) {
    response.status = status;
    response.set_content(value.dump(), "application/json; charset=UTF-8");
}
}

HttpServer::HttpServer(int port, std::string webRoot, std::string settingsPath)
    : port_(port),
      webRoot_(std::move(webRoot)),
      settingsPath_(std::move(settingsPath)) {
    setupCors();
    setupRoutes();
}

void HttpServer::setupCors() {
    server_.set_default_headers({
        {"Access-Control-Allow-Origin", "*"},
        {"Access-Control-Allow-Headers", "Content-Type"},
        {"Access-Control-Allow-Methods", "GET, PUT, POST, OPTIONS"}
    });
    server_.Options(R"(.*)", [](const httplib::Request&, httplib::Response& response) {
        response.status = 204;
    });
}

void HttpServer::setupRoutes() {
    server_.Get("/api/health", [](const httplib::Request&, httplib::Response& response) {
        sendJson(response, {{"status", "ok"}, {"service", "vocabmaster"}, {"checkpoint", "platform"}});
    });

    // Stable API placeholders keep the original frontend byte-for-byte intact
    // while feature-owned backend modules are merged one checkpoint at a time.
    server_.Get("/api/words", [](const httplib::Request&, httplib::Response& response) {
        sendJson(response, json::array());
    });
    server_.Get("/api/topics", [](const httplib::Request&, httplib::Response& response) {
        sendJson(response, json::array());
    });
    server_.Get("/api/study/session", [](const httplib::Request&, httplib::Response& response) {
        sendJson(response, {{"currentSession", 1}});
    });
    server_.Get("/api/study/due", [](const httplib::Request&, httplib::Response& response) {
        sendJson(response, json::array());
    });
    server_.Get("/api/analytics/dashboard", [](const httplib::Request&, httplib::Response& response) {
        sendJson(response, {{"totalWords", 0}, {"learnedCount", 0}, {"memorizedCount", 0},
                            {"overallAccuracy", 0}, {"totalAttempts", 0}, {"dueCount", 0},
                            {"topics", json::array()}, {"weakWords", json::array()},
                            {"quizHistory", json::array()}, {"distribution", json::object()}});
    });
    server_.Get("/api/analytics/timeline", [](const httplib::Request&, httplib::Response& response) {
        sendJson(response, json::array());
    });
    server_.Get("/api/analytics/activity", [](const httplib::Request&, httplib::Response& response) {
        sendJson(response, json::array());
    });
    server_.Get("/api/dictionary/meta", [](const httplib::Request&, httplib::Response& response) {
        sendJson(response, {{"entries", 0}, {"source", "pending"}, {"storage", "local"}});
    });
    server_.Get("/api/dictionary/search", [](const httplib::Request&, httplib::Response& response) {
        sendJson(response, json::array());
    });
    server_.Get("/api/quiz/history", [](const httplib::Request&, httplib::Response& response) {
        sendJson(response, json::array());
    });

    server_.Get("/api/settings", [this](const httplib::Request&, httplib::Response& response) {
        sendJson(response, readJsonFile(settingsPath_, defaultSettings()));
    });

    server_.Put("/api/settings", [this](const httplib::Request& request, httplib::Response& response) {
        try {
            const json incoming = json::parse(request.body);
            json settings = defaultSettings();
            settings["profileName"] = incoming.value("profileName", "Người học");
            settings["dailyGoal"] = incoming.value("dailyGoal", 20);
            settings["soundEnabled"] = incoming.value("soundEnabled", true);

            if (settings["profileName"].get<std::string>().empty()) {
                sendJson(response, {{"error", "Tên hiển thị không được để trống"}}, 400);
                return;
            }
            if (!writeJsonFile(settingsPath_, settings)) {
                sendJson(response, {{"error", "Không thể lưu cài đặt"}}, 500);
                return;
            }
            sendJson(response, settings);
        } catch (const std::exception&) {
            sendJson(response, {{"error", "JSON không hợp lệ"}}, 400);
        }
    });

    server_.Get("/api/export", [this](const httplib::Request&, httplib::Response& response) {
        sendJson(response, {{"version", 1}, {"settings", readJsonFile(settingsPath_, defaultSettings())},
                            {"words", json::array()}, {"topics", json::array()},
                            {"progress", json::array()}, {"quizHistory", json::array()},
                            {"activityHistory", json::array()}});
    });

    server_.Post("/api/import", [this](const httplib::Request& request, httplib::Response& response) {
        try {
            const json backup = json::parse(request.body);
            if (!backup.contains("settings") || !backup["settings"].is_object()) {
                sendJson(response, {{"error", "File backup thiếu settings"}}, 400);
                return;
            }
            if (!writeJsonFile(settingsPath_, backup["settings"])) {
                sendJson(response, {{"error", "Không thể nhập dữ liệu"}}, 500);
                return;
            }
            sendJson(response, {{"status", "imported"}});
        } catch (const std::exception&) {
            sendJson(response, {{"error", "File backup không hợp lệ"}}, 400);
        }
    });

    if (!server_.set_mount_point("/", webRoot_)) {
        std::cerr << "[WARN] Cannot mount web root: " << webRoot_ << '\n';
    }
}

void HttpServer::start() {
    std::cout << "[SERVER] http://localhost:" << port_ << '\n';
    if (!server_.listen("0.0.0.0", port_)) {
        std::cerr << "[ERROR] Cannot listen on port " << port_ << '\n';
    }
}

void HttpServer::stop() {
    server_.stop();
}

int HttpServer::getPort() const {
    return port_;
}
