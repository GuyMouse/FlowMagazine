import React, { useMemo } from "react"
import "./Chart.scss"
import { Chart as ChartJS } from "chart.js";
import { Chart as ReactChart } from "react-chartjs-2";
import {
    BarElement,
    LineElement,
    PointElement,
    CategoryScale,
    LinearScale,
    LineController,
    BarController,
    Legend,
    Tooltip
} from "chart.js";

ChartJS.register(
    BarElement,
    LineElement,
    PointElement,
    CategoryScale,
    LinearScale,
    LineController,
    BarController,
    Legend,
    Tooltip
);

export interface ChartProps {
    dataBar: { title: string; grade: number }[];
    dataLine: { title: string; grade: number }[];

    chartTitle?: string;
}

const Chart: React.FC<ChartProps> = ({ dataBar, dataLine, chartTitle }) => {
    const xlabel = useMemo(() => dataBar.map((row) => row.title), [dataBar]);

    const mydata = {
        labels: xlabel,
        datasets: [{
            type: 'bar' as const,
            label: 'ציונים',
            data: dataBar.map((row) => row.grade),
            borderColor: '#224687',
            backgroundColor: 'rgba(34, 70, 135, 0.5)',
        }, {
            type: 'line' as const,
            label: 'ממוצע',
            data: dataLine.map((row) => row.grade),
            borderColor: 'red',
            backgroundColor: 'orange',
            borderDash: [5, 5],
            pointBackgroundColor: '#FFFF',
        }]
    };

    const myoptions = useMemo(() => ({
        responsive: true,
        scales: {
            x: {
                title: { display: true, text: 'שם ההדרכה' },
            },
            y: {
                beginAtZero: true,
                max: 100,
                ticks: { stepSize: 20 },
                position: "right" as const,
                title: { display: true, text: 'ציון' },
            }
        },
        plugins: {
            legend: { position: 'top' as const },
            title: {
                display: true,
                text: chartTitle ?? 'ציונים',
            }
        }
    }), [chartTitle]);

    return (
        <div className="chart-container">
            <ReactChart data={mydata} options={myoptions} type="bar" />
        </div>
    );




}
export default Chart;

