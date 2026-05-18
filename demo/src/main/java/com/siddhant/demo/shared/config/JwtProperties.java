package com.siddhant.demo.shared.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "app.jwt")
public class JwtProperties {

	private String secret;
	private long accessExpirationMinutes = 15;
	private long refreshExpirationDays = 7;
}
