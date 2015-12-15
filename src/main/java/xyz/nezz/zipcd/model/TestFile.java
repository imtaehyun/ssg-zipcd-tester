package xyz.nezz.zipcd.model;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Created by 140179 on 2015-12-15.
 */
@Component
@ConfigurationProperties(locations = "classpath:input.yml")
public @Data class TestFile {
    public String zone;
    public List<Zipcd> list;
}
