import {
    Chart as ChartJS,
    ChartData,
    ChartDataset,
    ChartOptions,
    Filler,
    LinearScale,
    LineElement,
    PointElement,
    Plugin,
} from 'chart.js';
import { DeepPartial } from 'ts-essentials';
import { useState } from 'react';
import { deepmerge, deepmergeCustom } from 'deepmerge-ts';

/* ── Gradient fill plugin ─────────────────────────────────────── */
const gradientFillPlugin: Plugin<'line'> = {
    id: 'gradientFill',
    beforeDraw(chart) {
        const { ctx, chartArea } = chart;
        if (!chartArea) return;
        chart.data.datasets.forEach((dataset) => {
            const color = typeof dataset.borderColor === 'string' ? dataset.borderColor : null;
            if (!color || !color.startsWith('#')) return;
            const r = parseInt(color.slice(1, 3), 16);
            const g = parseInt(color.slice(3, 5), 16);
            const b = parseInt(color.slice(5, 7), 16);
            const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
            gradient.addColorStop(0,    `rgba(${r},${g},${b},0.28)`);
            gradient.addColorStop(0.55, `rgba(${r},${g},${b},0.07)`);
            gradient.addColorStop(1,    `rgba(${r},${g},${b},0)`);
            (dataset as any).backgroundColor = gradient;
        });
    },
};

ChartJS.register(LineElement, PointElement, Filler, LinearScale, gradientFillPlugin);

const options: ChartOptions<'line'> = {
    responsive: true,
    animation: false,
    plugins: {
        legend:  { display: false },
        title:   { display: false },
        tooltip: { enabled: false },
    },
    layout: {
        padding: { top: 12, left: 2, right: 2, bottom: 0 },
    },
    scales: {
        x: {
            min: 0,
            max: 19,
            type: 'linear',
            grid:  { display: false, drawBorder: false },
            ticks: { display: false },
        },
        y: {
            min: 0,
            type: 'linear',
            grid: {
                display: true,
                color: 'rgba(255,255,255,0.035)',
                drawBorder: false,
                borderDash: [3, 7],
            },
            ticks: {
                display: true,
                count: 3,
                color: 'rgba(255,255,255,0.18)',
                font: {
                    family: "'Sora', sans-serif",
                    size: 9,
                    weight: '500',
                },
                padding: 8,
            },
        },
    },
    elements: {
        point: {
            radius: 0,
            hoverRadius: 0,
        },
        line: {
            tension: 0.45,
            borderWidth: 1.75,
        },
    },
};

function getOptions(opts?: DeepPartial<ChartOptions<'line'>> | undefined): ChartOptions<'line'> {
    return deepmerge(options, opts || {});
}

type ChartDatasetCallback = (value: ChartDataset<'line'>, index: number) => ChartDataset<'line'>;

function getEmptyData(label: string, sets = 1, callback?: ChartDatasetCallback | undefined): ChartData<'line'> {
    const next = callback || ((value) => value);

    return {
        labels: Array(20).fill(0).map((_, i) => i),
        datasets: Array(sets).fill(0).map((_, index) =>
            next(
                {
                    fill: true,
                    label,
                    data: Array(20).fill(-5),
                    borderColor: '#FF7D20',
                    backgroundColor: 'transparent',
                },
                index
            )
        ),
    };
}

const merge = deepmergeCustom({ mergeArrays: false });

interface UseChartOptions {
    sets: number;
    options?: DeepPartial<ChartOptions<'line'>> | number | undefined;
    callback?: ChartDatasetCallback | undefined;
}

function useChart(label: string, opts?: UseChartOptions) {
    const options = getOptions(
        typeof opts?.options === 'number' ? { scales: { y: { min: 0, suggestedMax: opts.options } } } : opts?.options
    );
    const [data, setData] = useState(getEmptyData(label, opts?.sets || 1, opts?.callback));

    const push = (items: number | null | (number | null)[]) =>
        setData((state) =>
            merge(state, {
                datasets: (Array.isArray(items) ? items : [items]).map((item, index) => ({
                    ...state.datasets[index],
                    data: state.datasets[index].data
                        .slice(1)
                        .concat(typeof item === 'number' ? Number(item.toFixed(2)) : item),
                })),
            })
        );

    const clear = () =>
        setData((state) =>
            merge(state, {
                datasets: state.datasets.map((value) => ({
                    ...value,
                    data: Array(20).fill(-5),
                })),
            })
        );

    return { props: { data, options }, push, clear };
}

function useChartTickLabel(label: string, max: number, tickLabel: string, roundTo?: number) {
    return useChart(label, {
        sets: 1,
        options: {
            scales: {
                y: {
                    suggestedMax: max,
                    ticks: {
                        callback(value) {
                            return `${roundTo ? Number(value).toFixed(roundTo) : value}${tickLabel}`;
                        },
                    },
                },
            },
        },
    });
}

export { useChart, useChartTickLabel, getOptions, getEmptyData };
