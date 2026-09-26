cmake_minimum_required(VERSION 3.15)
project(VocabularySystem VERSION 1.0.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

if(MSVC)
    add_compile_options(/W4)
else()
    add_compile_options(-Wall -Wextra -pedantic)
endif()

set(SERVER_ROOT ${CMAKE_CURRENT_SOURCE_DIR}/apps/server)
file(GLOB_RECURSE SERVER_SOURCES CONFIGURE_DEPENDS ${SERVER_ROOT}/src/*.cpp)

add_executable(VocabularySystem ${SERVER_SOURCES})
target_include_directories(VocabularySystem PRIVATE ${SERVER_ROOT}/include)

if(WIN32)
    target_link_libraries(VocabularySystem PRIVATE ws2_32)
endif()
