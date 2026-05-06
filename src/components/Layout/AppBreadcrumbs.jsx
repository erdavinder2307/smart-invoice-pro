import React from "react";
import { Breadcrumbs, Link, Typography, Box } from "@mui/material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { useLocation, useNavigate } from "react-router-dom";

const toLabel = (segment) =>
  segment
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

const AppBreadcrumbs = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const segments = location.pathname.split("/").filter(Boolean);
  const isDashboardPage = location.pathname === "/dashboard" || segments.length === 0;

  return (
    <Box sx={{ px: { xs: 1.5, md: 2.5 }, py: 1, borderBottom: "1px solid", borderColor: "divider", bgcolor: "background.paper" }}>
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        aria-label="breadcrumb"
        sx={{ "& .MuiBreadcrumbs-li": { fontSize: "0.75rem" } }}
      >
        <Link
          underline="hover"
          color="inherit"
          onClick={() => navigate("/dashboard")}
          sx={{ cursor: "pointer", fontSize: "0.75rem" }}
        >
          Dashboard
        </Link>

        {!isDashboardPage && segments.map((segment, index) => {
          const fullPath = `/${segments.slice(0, index + 1).join("/")}`;
          const isLast = index === segments.length - 1;
          const label = toLabel(segment);

          if (isLast) {
            return (
              <Typography key={fullPath} color="text.primary" sx={{ fontSize: "0.75rem", fontWeight: 600 }}>
                {label}
              </Typography>
            );
          }

          return (
            <Link
              key={fullPath}
              underline="hover"
              color="inherit"
              onClick={() => navigate(fullPath)}
              sx={{ cursor: "pointer", fontSize: "0.75rem" }}
            >
              {label}
            </Link>
          );
        })}
      </Breadcrumbs>
    </Box>
  );
};

export default AppBreadcrumbs;
