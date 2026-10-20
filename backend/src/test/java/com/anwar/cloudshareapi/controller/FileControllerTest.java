package com.anwar.cloudshareapi.controller;

import com.anwar.cloudshareapi.dto.FileMatadataDTO;
import com.anwar.cloudshareapi.service.FileMatadataService;
import com.anwar.cloudshareapi.service.UserCreditsService;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class FileControllerTest {
    private final FileMatadataService fileMatadataService = mock(FileMatadataService.class);
    private final FileController controller = new FileController(
            fileMatadataService,
            mock(UserCreditsService.class));

    @Test
    void redirectsPublicFileContentToCloudinary() {
        String cloudinaryUrl = "https://res.cloudinary.com/demo/image/upload/sample.pdf";
        when(fileMatadataService.getPublicFile("file-id"))
                .thenReturn(FileMatadataDTO.builder().cloudinaryUrl(cloudinaryUrl).build());

        ResponseEntity<?> response = controller.getPublicFileContent("file-id");

        assertEquals(HttpStatus.FOUND, response.getStatusCode());
        assertEquals(cloudinaryUrl, response.getHeaders().getLocation().toString());
    }

    @Test
    void rejectsNonCloudinaryFileContentUrl() {
        when(fileMatadataService.getPublicFile("file-id"))
                .thenReturn(FileMatadataDTO.builder()
                        .cloudinaryUrl("https://example.com/file.pdf")
                        .build());

        ResponseEntity<?> response = controller.getPublicFileContent("file-id");

        assertEquals(HttpStatus.BAD_GATEWAY, response.getStatusCode());
    }
}
