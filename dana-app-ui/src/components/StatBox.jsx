import { Box, Typography, useTheme } from "@mui/material";
import { tokens } from "../theme";
import ProgressCircle from "./ProgressCircle";

const StatBox = ({ title, subtitle, icon, progress, increase, colorTheme,textColor }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  if(colorTheme !== undefined){
    colorTheme = colors.redAccent[500];
  }
  if(textColor!==undefined){
    textColor = colors.redAccent[600];
  }
  return (
    <Box width="100%" m="0 30px">
      <Box display="flex" justifyContent="space-between">
        <Box>
          {icon}
          <Typography
            variant="h4"
            fontWeight="bold"
            sx={{ color: textColor?textColor:colors.grey[100] }}
          >
            {title}
          </Typography>
        </Box>
        <Box>
         { progress && <ProgressCircle progress={progress} secondaryColor={colorTheme?colorTheme:colors.blueAccent[500]}/>}
        </Box>
      </Box>
      <Box display="flex" justifyContent="space-between" mt="2px">
        <Typography variant="h5" sx={{ color: textColor?textColor:colors.greenAccent[500] }}>
          {subtitle}
        </Typography>
        <Typography
          variant="h5"
          fontStyle="italic"
          sx={{ color: colors.greenAccent[600] }}
        >
          {increase}
        </Typography>
      </Box>
    </Box>
  );
};

export default StatBox;
