#ifndef STRING_UTILS_H
#define STRING_UTILS_H

#include <string>
#include <vector>

class StringUtils {
public:
    static std::string trim(const std::string& str);
    static std::string toLowerCase(const std::string& str);
    static std::string toUpperCase(const std::string& str);
    static std::vector<std::string> split(const std::string& str, char delimiter);
    static std::string join(const std::vector<std::string>& elements, char delimiter);
    static std::string join(const std::vector<std::string>& elements, const std::string& delimiter);
    static std::vector<std::string> parseCsvLine(const std::string& line);
    static std::string escapeCsvField(const std::string& field);
    static bool equalsIgnoreCase(const std::string& a, const std::string& b);
};

#endif // STRING_UTILS_H
