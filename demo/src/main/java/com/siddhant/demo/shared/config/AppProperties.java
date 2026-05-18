package com.siddhant.demo.shared.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.List;

@Getter
@Setter
@ConfigurationProperties(prefix = "app")
public class AppProperties {

	private Api api = new Api();
	private Cors cors = new Cors();

	@Getter
	@Setter
	public static class Api {
		private String version = "v1";
	}

	@Getter
	@Setter
	public static class Cors {
		private List<String> allowedOrigins = List.of("http://localhost:3000");
	}
}
