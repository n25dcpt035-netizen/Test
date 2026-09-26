#include "utils/TimeUtils.h"

#include <chrono>
#include <ctime>
#include <iomanip>
#include <sstream>

namespace {
std::tm localTime(std::time_t value) {
    std::tm result{};
#ifdef _WIN32
    localtime_s(&result, &value);
#else
    localtime_r(&value, &result);
#endif
    return result;
}
}

namespace TimeUtils {

Timestamp now() {
    return std::chrono::duration_cast<std::chrono::seconds>(
        std::chrono::system_clock::now().time_since_epoch()).count();
}

Timestamp addDays(Timestamp value, int days) {
    return value + static_cast<Timestamp>(days) * 24 * 60 * 60;
}

std::string toLocalIso(Timestamp value) {
    if (value <= 0) return "";
    const std::tm local = localTime(static_cast<std::time_t>(value));
    std::ostringstream out;
    out << std::put_time(&local, "%Y-%m-%dT%H:%M:%S");
    return out.str();
}

std::string toLocalDate(Timestamp value) {
    if (value <= 0) return "";
    const std::tm local = localTime(static_cast<std::time_t>(value));
    std::ostringstream out;
    out << std::put_time(&local, "%Y-%m-%d");
    return out.str();
}

std::string localWeekday(Timestamp value) {
    if (value <= 0) return "";
    const std::tm local = localTime(static_cast<std::time_t>(value));
    std::ostringstream out;
    out << std::put_time(&local, "%a");
    return out.str();
}

}
