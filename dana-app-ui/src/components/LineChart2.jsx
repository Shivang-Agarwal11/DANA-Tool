import { ResponsiveLine } from "@nivo/line";
import { useTheme } from "@mui/material";
import { tokens } from "../theme";

const LineChart2 = ({ commitData, codeFrequencyData, isDashboard = false }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // Format Commit Data 📊
  const formattedCommits = commitData.map((entry) => ({
    x: new Date(entry.week * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric" }), // Convert to readable date
    y: entry.total, // Fix: Use `total` instead of `commits`
  }));
  
  // Format Code Frequency Data 📈
  const formattedCodeFrequency = {
    additions: codeFrequencyData.map((entry, index) => ({
      x: new Date((commitData[index]?.week ?? 0) * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric" }), // Align with commit dates
      y: entry[1], // GitHub API: Index 1 is additions
    })),
    deletions: codeFrequencyData.map((entry, index) => ({
      x: new Date((commitData[index]?.week ?? 0) * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric" }), // Align with commit dates
      y: Math.abs(entry[2]), // GitHub API: Index 2 is deletions (negative value)
    })),
  };

  // Combine into Nivo Data Format
  const data = [
    {
      id: "Commits",
      color: "#8884d8",
      data: formattedCommits,
    },
    {
      id: "Additions",
      color: "#4CAF50",
      data: formattedCodeFrequency.additions,
    },
    {
      id: "Deletions",
      color: "#F44336",
      data: formattedCodeFrequency.deletions,
    },
  ];

  return (
    <ResponsiveLine
      data={data}
      theme={{
        axis: {
          domain: {
            line: { stroke: colors.grey[100] },
          },
          legend: { text: { fill: colors.grey[100] } },
          ticks: {
            line: { stroke: colors.grey[100], strokeWidth: 1 },
            text: { fill: colors.grey[100] },
          },
        },
        legends: { text: { fill: colors.grey[100] } },
        tooltip: { container: { color: colors.primary[500] } },
      }}
      colors={{ datum: "color" }}
      margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
      xScale={{ type: "point" }}
      yScale={{ type: "linear", min: "auto", max: "auto", stacked: false }}
      yFormat=" >-.2f"
      curve="catmullRom"
      axisTop={null}
      axisRight={null}
      axisBottom={{
        orient: "bottom",
        tickSize: 0,
        tickPadding: 5,
        tickRotation: 0,
        legend: isDashboard ? undefined : "Weeks",
        legendOffset: 36,
        legendPosition: "middle",
      }}
      axisLeft={{
        orient: "left",
        tickSize: 3,
        tickPadding: 5,
        tickRotation: 0,
        legend: isDashboard ? undefined : "Count",
        legendOffset: -40,
        legendPosition: "middle",
      }}
      enableGridX={false}
      enableGridY={false}
      pointSize={8}
      pointColor={{ theme: "background" }}
      pointBorderWidth={2}
      pointBorderColor={{ from: "serieColor" }}
      pointLabelYOffset={-12}
      useMesh={true}
      legends={[
        {
          anchor: "bottom-right",
          direction: "column",
          translateX: 100,
          itemsSpacing: 0,
          itemWidth: 80,
          itemHeight: 20,
          symbolSize: 12,
          symbolShape: "circle",
          symbolBorderColor: "rgba(0, 0, 0, .5)",
          effects: [
            {
              on: "hover",
              style: { itemBackground: "rgba(0, 0, 0, .03)", itemOpacity: 1 },
            },
          ],
        },
      ]}
    />
  );
};

export default LineChart2;
