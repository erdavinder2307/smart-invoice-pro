import React from "react";
import MainLayout from "../Layout/MainLayout";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";

const ListPageLayout = ({ children, maxWidth = false }) => {
  return (
    <MainLayout>
      <Container
        maxWidth={maxWidth}
        sx={{
          px: { xs: 2, md: 3 },
          py: { xs: 2, md: 2.5 },
          bgcolor: "#f7f8fb",
          minHeight: "100%",
        }}
      >
        <Box>{children}</Box>
      </Container>
    </MainLayout>
  );
};

export default ListPageLayout;
