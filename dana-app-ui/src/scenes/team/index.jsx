import { Box, Typography, useTheme } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import { mockDataTeam } from "../../data/mockData";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import Header from "../../components/Header";

const Team = ({data, type_table}) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  var columns = [];
  if (type_table === "issues") {
    columns = [
      { field: "key", headerName: "Key", flex: 1 },
      {
        field: "message",
        headerName: "Message",
        flex: 1,
        cellClassName: "name-column--cell",
      },
      {
        field: "severity",
        headerName: "Severity",
        type: "number",
        headerAlign: "left",
        align: "left",
        renderCell: (params) => (
          <Typography
            sx={{
              color:
                params.value === "BLOCKER"
                  ? colors.redAccent[700]
                  : params.value === "MAJOR"
                  ? colors.redAccent[500]
                  : params.value === "MINOR"
                  ? colors.redAccent[400]
                  : "inherit",
              fontWeight: "bold",
            }}
          >
            {params.value}
          </Typography>
        ),
      },
      {
        field: "type",
        headerName: "Type",
        flex: 1,
      }
    ];
  }else if (type_table === "rules") {
    columns = [
      { field: "key", headerName: "Key", flex: 1 },
      {
        field: "name",
        headerName: "Name",
        flex: 1,
        cellClassName: "name-column--cell",
      },
      {
        field: "severity",
        headerName: "Severity",
        type: "number",
        headerAlign: "left",
        align: "left",
        renderCell: (params) => (
          <Typography
            sx={{
              color:
                params.value == "CRITICAL"
                  ? colors.redAccent[600]
                  : params.value == "MAJOR"
                  ? colors.redAccent[400]
                  : params.value == "INFO"
                  ? colors.greenAccent[600]
                  : params.value == "MINOR"
                  ? colors.redAccent[300]:
                  "inherit",
              fontWeight: "bold",
            }}
          >
            {params.value}
          </Typography>
        ),
      },
    ];
  }else if(type_table === "security"){
    for(var i = 0; i < data.length; i++){
      data[i].key = i;
    }
    columns = [
      { field: "key", headerName: "Key", flex: 1 },
      {
        field: "message",
        headerName: "Message",
        flex: 1,
        cellClassName: "name-column--cell",
      },
      {
        field: "status",
        headerName: "Status",
        renderCell: (params) => (
          <Typography
            sx={{
              color:
                params.value == "TO_REVIEW"
                  ? colors.greenAccent[600]
                  :
                  "inherit",
              fontWeight: "bold",
            }}
          >
            {params.value}
          </Typography>
        ),
      },
    ];
  }
  return (
    <Box m="20px">
      <Box
        // m="40px 0 0 0"
        height="65vh"
        sx={{
          "& .MuiDataGrid-root": {
            border: "none",
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "none",
          },
          "& .name-column--cell": {
            color: colors.primary[100],
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: colors.blueAccent[700],
            borderBottom: "none",
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: colors.primary[400],
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "none",
            backgroundColor: colors.blueAccent[700],
          },
          "& .MuiCheckbox-root": {
            color: `${colors.greenAccent[200]} !important`,
          },
          "& .name-column--severity":{
            color: colors.redAccent[500]
          } 
        }}
      >
        <DataGrid rows={data} columns={columns} getRowId={(row) => row.key} autoPageSize sx={{
          "& .MuiDataGrid-columnHeaders": { fontSize: "16px" },
          "& .MuiDataGrid-cell": { fontSize: "14px", whiteSpace: "nowrap" }
        }} />
      </Box>
    </Box>
  );
};

export default Team;
