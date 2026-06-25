package com.siddhant.demo.modules.invoice.infrastructure.storage;

import com.siddhant.demo.shared.config.PdfProperties;
import com.siddhant.demo.shared.exception.BusinessException;
import com.siddhant.demo.shared.exception.ErrorCode;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Service
public class FileDocumentStorageService {

	private final Path rootPath;

	public FileDocumentStorageService(PdfProperties pdfProperties) {
		this.rootPath = Paths.get(pdfProperties.storagePath()).toAbsolutePath().normalize();
	}

	public void store(String storageKey, byte[] content) {
		try {
			Path target = resolve(storageKey);
			Files.createDirectories(target.getParent());
			Files.write(target, content);
		} catch (IOException ex) {
			throw new BusinessException(ErrorCode.PDF_GENERATION_FAILED, "Failed to store PDF document");
		}
	}

	public byte[] read(String storageKey) {
		try {
			Path target = resolve(storageKey);
			if (!Files.exists(target)) {
				throw new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "PDF document not found");
			}
			return Files.readAllBytes(target);
		} catch (IOException ex) {
			throw new BusinessException(ErrorCode.PDF_GENERATION_FAILED, "Failed to read PDF document");
		}
	}

	public boolean exists(String storageKey) {
		return Files.exists(resolve(storageKey));
	}

	private Path resolve(String storageKey) {
		Path resolved = rootPath.resolve(storageKey).normalize();
		if (!resolved.startsWith(rootPath)) {
			throw new BusinessException(ErrorCode.PDF_GENERATION_FAILED, "Invalid document storage path");
		}
		return resolved;
	}
}
