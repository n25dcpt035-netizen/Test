#ifndef TIME_UTILS_H
#define TIME_UTILS_H

#include <string>

namespace TimeUtils {

using Timestamp = long long;

Timestamp now();
Timestamp addDays(Timestamp value, int days);
std::string toLocalIso(Timestamp value);
std::string toLocalDate(Timestamp value);
std::string localWeekday(Timestamp value);

}

#endif // TIME_UTILS_H
