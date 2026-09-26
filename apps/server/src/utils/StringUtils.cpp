#include "utils/StringUtils.h"
#include <algorithm>
#include <cctype>
#include <sstream>

std::string StringUtils::trim(const std::string& str) {
    size_t first = 0;
    while (first < str.size() && (std::isspace(static_cast<unsigned char>(str[first])) || str[first] == '\r' || str[first] == '\n')) {
        first++;
    }
    if (first == str.size()) {
        return "";
    }
    size_t last = str.size() - 1;
    while (last > first && (std::isspace(static_cast<unsigned char>(str[last])) || str[last] == '\r' || str[last] == '\n')) {
        last--;
    }
    return str.substr(first, last - first + 1);
}

#ifdef _WIN32
#include <windows.h>

std::string StringUtils::toLowerCase(const std::string& str) {
    if (str.empty()) return "";
    int wlen = MultiByteToWideChar(CP_UTF8, 0, str.c_str(), -1, NULL, 0);
    if (wlen <= 0) {
        // Fallback ASCII
        std::string res = str;
        for (char& c : res) {
            if (c >= 'A' && c <= 'Z') c = static_cast<char>(c + 32);
        }
        return res;
    }
    std::wstring wstr(wlen, 0);
    MultiByteToWideChar(CP_UTF8, 0, str.c_str(), -1, &wstr[0], wlen);

    int lowerLen = LCMapStringW(LOCALE_USER_DEFAULT, LCMAP_LOWERCASE, wstr.c_str(), -1, NULL, 0);
    std::wstring lowerWstr(lowerLen, 0);
    LCMapStringW(LOCALE_USER_DEFAULT, LCMAP_LOWERCASE, wstr.c_str(), -1, &lowerWstr[0], lowerLen);

    int ulen = WideCharToMultiByte(CP_UTF8, 0, lowerWstr.c_str(), -1, NULL, 0, NULL, NULL);
    if (ulen <= 1) return "";
    std::string res(ulen - 1, 0);
    WideCharToMultiByte(CP_UTF8, 0, lowerWstr.c_str(), -1, &res[0], ulen, NULL, NULL);
    return res;
}

std::string StringUtils::toUpperCase(const std::string& str) {
    if (str.empty()) return "";
    int wlen = MultiByteToWideChar(CP_UTF8, 0, str.c_str(), -1, NULL, 0);
    if (wlen <= 0) {
        // Fallback ASCII
        std::string res = str;
        for (char& c : res) {
            if (c >= 'a' && c <= 'z') c = static_cast<char>(c - 32);
        }
        return res;
    }
    std::wstring wstr(wlen, 0);
    MultiByteToWideChar(CP_UTF8, 0, str.c_str(), -1, &wstr[0], wlen);

    int upperLen = LCMapStringW(LOCALE_USER_DEFAULT, LCMAP_UPPERCASE, wstr.c_str(), -1, NULL, 0);
    std::wstring upperWstr(upperLen, 0);
    LCMapStringW(LOCALE_USER_DEFAULT, LCMAP_UPPERCASE, wstr.c_str(), -1, &upperWstr[0], upperLen);

    int ulen = WideCharToMultiByte(CP_UTF8, 0, upperWstr.c_str(), -1, NULL, 0, NULL, NULL);
    if (ulen <= 1) return "";
    std::string res(ulen - 1, 0);
    WideCharToMultiByte(CP_UTF8, 0, upperWstr.c_str(), -1, &res[0], ulen, NULL, NULL);
    return res;
}
#else
std::string StringUtils::toLowerCase(const std::string& str) {
    std::string result = str;
    for (char& c : result) {
        if (c >= 'A' && c <= 'Z') {
            c = static_cast<char>(c + 32);
        }
    }
    return result;
}

std::string StringUtils::toUpperCase(const std::string& str) {
    std::string result = str;
    for (char& c : result) {
        if (c >= 'a' && c <= 'z') {
            c = static_cast<char>(c - 32);
        }
    }
    return result;
}
#endif

std::vector<std::string> StringUtils::split(const std::string& str, char delimiter) {
    std::vector<std::string> tokens;
    if (str.empty()) {
        return tokens;
    }
    std::string token;
    std::istringstream tokenStream(str);
    while (std::getline(tokenStream, token, delimiter)) {
        tokens.push_back(token);
    }
    // If str ends with delimiter, getline might not push an empty token
    if (!str.empty() && str.back() == delimiter) {
        tokens.push_back("");
    }
    return tokens;
}

std::string StringUtils::join(const std::vector<std::string>& elements, char delimiter) {
    return join(elements, std::string(1, delimiter));
}

std::string StringUtils::join(const std::vector<std::string>& elements, const std::string& delimiter) {
    if (elements.empty()) {
        return "";
    }
    std::string result;
    for (size_t i = 0; i < elements.size(); ++i) {
        result += elements[i];
        if (i + 1 < elements.size()) {
            result += delimiter;
        }
    }
    return result;
}

std::vector<std::string> StringUtils::parseCsvLine(const std::string& line) {
    std::vector<std::string> fields;
    std::string current;
    bool inQuotes = false;

    for (size_t i = 0; i < line.size(); ++i) {
        char c = line[i];
        if (inQuotes) {
            if (c == '"') {
                if (i + 1 < line.size() && line[i + 1] == '"') {
                    current += '"';
                    ++i; // skip escaped quote
                } else {
                    inQuotes = false;
                }
            } else {
                current += c;
            }
        } else {
            if (c == '"') {
                inQuotes = true;
            } else if (c == ',') {
                fields.push_back(current);
                current.clear();
            } else if (c == '\r' || c == '\n') {
                // Ignore trailing newline characters
                continue;
            } else {
                current += c;
            }
        }
    }
    fields.push_back(current);
    return fields;
}

std::string StringUtils::escapeCsvField(const std::string& field) {
    bool needQuotes = false;
    if (field.find(',') != std::string::npos ||
        field.find('"') != std::string::npos ||
        field.find('\n') != std::string::npos ||
        field.find('\r') != std::string::npos) {
        needQuotes = true;
    }

    if (!needQuotes) {
        return field;
    }

    std::string escaped = "\"";
    for (char c : field) {
        if (c == '"') {
            escaped += "\"\"";
        } else {
            escaped += c;
        }
    }
    escaped += "\"";
    return escaped;
}

bool StringUtils::equalsIgnoreCase(const std::string& a, const std::string& b) {
    return toLowerCase(trim(a)) == toLowerCase(trim(b));
}
