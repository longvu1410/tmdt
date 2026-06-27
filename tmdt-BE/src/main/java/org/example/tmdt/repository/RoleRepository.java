package org.example.tmdt.repository;

import java.util.Optional;
import org.example.tmdt.entity.Role;
import org.example.tmdt.enums.RoleName;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoleRepository extends JpaRepository<Role, Long> {

    Optional<Role> findByName(RoleName name);
}
