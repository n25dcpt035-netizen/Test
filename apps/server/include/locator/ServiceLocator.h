#ifndef SERVICE_LOCATOR_H
#define SERVICE_LOCATOR_H

#include <memory>
#include <typeindex>
#include <unordered_map>
#include <stdexcept>
#include <string>

class ServiceLocator {
private:
    std::unordered_map<std::type_index, std::shared_ptr<void>> services;

    ServiceLocator() = default;

public:
    static ServiceLocator& getInstance() {
        static ServiceLocator instance;
        return instance;
    }

    ServiceLocator(const ServiceLocator&) = delete;
    ServiceLocator& operator=(const ServiceLocator&) = delete;

    template<typename Interface, typename Implementation>
    void registerService(std::shared_ptr<Implementation> service) {
        services[std::type_index(typeid(Interface))] = std::static_pointer_cast<void>(service);
    }

    template<typename Interface>
    void registerInstance(std::shared_ptr<Interface> service) {
        services[std::type_index(typeid(Interface))] = std::static_pointer_cast<void>(service);
    }

    template<typename Interface>
    std::shared_ptr<Interface> resolve() const {
        auto it = services.find(std::type_index(typeid(Interface)));
        if (it == services.end()) {
            throw std::runtime_error(std::string("Service not registered in ServiceLocator: ") + typeid(Interface).name());
        }
        return std::static_pointer_cast<Interface>(it->second);
    }

    template<typename Interface>
    bool has() const {
        return services.find(std::type_index(typeid(Interface))) != services.end();
    }

    void reset() {
        services.clear();
    }
};

#endif // SERVICE_LOCATOR_H
