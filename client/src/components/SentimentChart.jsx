import { ResponsiveContainer, XAxis, YAxis, Tooltip, Line, LineChart, CartesianGrid } from 'recharts'

function TrendData({ data }) {
  const chartMargin = {top: 25, right:30, bottom: 15, left: -25}
  function formatXaxisDates(currentDate) {
    let date = new Date(currentDate)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric"
    })
  }
    return (
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={data} margin={chartMargin}>
          <CartesianGrid
            vertical={false}
            stroke="#27272a7e"
            strokeDasharray="5 3"
          />
          <XAxis
            dataKey="date"
            tickFormatter={formatXaxisDates}
            tickMargin={10}
          />
          <YAxis domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} />
          <Tooltip
            contentStyle={{
              // this style the hover box.
              backgroundColor: "#141417",
              border: "1px solid #27272A",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.5)",
            }}
            itemStyle={{ color: "#863BFF", fontWeight: 600 }} // this styles that rating num like 4.5.
            labelStyle={{
              color: "#A1A1AA",
              fontSize: "13px",
              paddingBottom: "4px",
            }} // this style that date.
            formatter={(value)=> [`${value} Stars`, `Average Rating`]} // [`Value`, `its label like in our case Average rating.`]
            labelFormatter={(value)=> formatXaxisDates(value)}
          />
          <Line
            type="monotone"
            dataKey="average_rating"
            stroke="#863BFF"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    );
}

export default TrendData;