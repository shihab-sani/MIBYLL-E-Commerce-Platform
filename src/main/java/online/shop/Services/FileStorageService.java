package online.shop.Services;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@Service
@Slf4j
public class FileStorageService {
    private final Path uploadDir;

    public FileStorageService(@Value("${app.upload.dir:/app/uploads}") String dir) {
        this.uploadDir = Paths.get(dir).toAbsolutePath().normalize();
    }

    public void deleteFile(String fileUrl) {
        if (fileUrl == null || fileUrl.isBlank()) return;

        try {
            // Extract just the filename (e.g., "uuid.jpg") from the full URL
            String filename = fileUrl.substring(fileUrl.lastIndexOf("/") + 1);
            Path target = uploadDir.resolve(filename);

            // Only delete if it actually exists in our upload folder
            if (Files.exists(target)) {
                Files.delete(target);
                log.info("Deleted orphaned file: {}", filename);
            }
        } catch (Exception e) {
            log.error("Could not delete file: {}", fileUrl, e);
        }
    }

    public void deleteFiles(List<String> fileUrls) {
        if (fileUrls == null) return;
        fileUrls.forEach(this::deleteFile);
    }
}
