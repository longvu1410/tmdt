package org.example.tmdt;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@SpringBootTest
class TmdtApplicationTests {

    @Test
    void contextLoads() {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

        System.out.println(
                encoder.matches(
                        "123456",
                        "$2a$10$ZX0Mo44DqQGA9.KcAAJRa.z08DTNFR3tIhPE2M5m4ufFQbs55rPB."
                )
        );
    }


}
