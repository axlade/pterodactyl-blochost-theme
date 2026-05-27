import React, { useEffect, useRef, useState } from 'react';
import { ServerContext } from '@/state/server';
import { SocketEvent } from '@/components/server/events';
import useWebsocketEvent from '@/plugins/useWebsocketEvent';
import { Line } from 'react-chartjs-2';
import { useChart, useChartTickLabel } from '@/components/server/console/chart';
import { bytesToString } from '@/lib/formatters';
import { hexToRgba } from '@/lib/helpers';
import ChartBlock from '@/components/server/console/ChartBlock';

const F = "'Sora', sans-serif";

export default () => {
    const status = ServerContext.useStoreState((state) => state.status.value);
    const limits = ServerContext.useStoreState((state) => state.server.data!.limits);
    const previous = useRef<Record<'tx' | 'rx', number>>({ tx: -1, rx: -1 });

    const [currentCpu, setCurrentCpu]       = useState(0);
    const [currentMem, setCurrentMem]       = useState(0);
    const [currentRxRate, setCurrentRxRate] = useState(0);
    const [currentTxRate, setCurrentTxRate] = useState(0);

    const cpu    = useChartTickLabel('CPU', limits.cpu, '%', 2);
    const memory = useChart('Memory', {
        sets: 1,
        options: {
            scales: {
                y: {
                    suggestedMax: limits.memory,
                    ticks: {
                        callback(value) {
                            return `${value} MiB`;
                        },
                    },
                },
            },
        },
        callback(opts) {
            return { ...opts, borderColor: '#a78bfa', backgroundColor: hexToRgba('#a78bfa', 0.18) };
        },
    });
    const network = useChart('Network', {
        sets: 2,
        options: {
            scales: {
                y: {
                    ticks: {
                        callback(value) {
                            return bytesToString(typeof value === 'string' ? parseInt(value, 10) : value);
                        },
                    },
                },
            },
        },
        callback(opts, index) {
            const colors = [
                { border: '#22d3ee', bg: hexToRgba('#22d3ee', 0.18) },
                { border: '#facc15', bg: hexToRgba('#facc15', 0.15) },
            ];
            return {
                ...opts,
                label: !index ? 'Entrant' : 'Sortant',
                borderColor: colors[index].border,
                backgroundColor: colors[index].bg,
            };
        },
    });

    useEffect(() => {
        if (status === 'offline') {
            cpu.clear();
            memory.clear();
            network.clear();
            setCurrentCpu(0);
            setCurrentMem(0);
            setCurrentRxRate(0);
            setCurrentTxRate(0);
        }
    }, [status]);

    useWebsocketEvent(SocketEvent.STATS, (data: string) => {
        let values: any = {};
        try {
            values = JSON.parse(data);
        } catch (e) {
            return;
        }
        const cpuVal = values.cpu_absolute ?? 0;
        const memMiB = Math.floor(values.memory_bytes / 1024 / 1024);
        const rxRate = previous.current.rx < 0 ? 0 : Math.max(0, values.network.rx_bytes - previous.current.rx);
        const txRate = previous.current.tx < 0 ? 0 : Math.max(0, values.network.tx_bytes - previous.current.tx);

        cpu.push(cpuVal);
        memory.push(memMiB);
        network.push([txRate, rxRate]);

        previous.current = { tx: values.network.tx_bytes, rx: values.network.rx_bytes };

        setCurrentCpu(cpuVal);
        setCurrentMem(values.memory_bytes);
        setCurrentRxRate(rxRate);
        setCurrentTxRate(txRate);
    });

    const cpuValue = (
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FF7D20', fontFamily: F }}>
            {currentCpu.toFixed(1)}%
        </span>
    );

    const memValue = (
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#a78bfa', fontFamily: F }}>
            {bytesToString(currentMem)}
        </span>
    );

    const netValue = (
        <span style={{ fontSize: '0.75rem', fontWeight: 600, fontFamily: F, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ color: '#22d3ee' }}>↓ {bytesToString(currentRxRate)}/s</span>
            <span style={{ color: '#facc15' }}>↑ {bytesToString(currentTxRate)}/s</span>
        </span>
    );

    return (
        <>
            <ChartBlock
                title={'CPU Load'}
                value={cpuValue}
                maxLabel={limits.cpu > 0 ? `${limits.cpu}%` : undefined}
                color={'#FF7D20'}
            >
                <Line {...cpu.props} />
            </ChartBlock>
            <ChartBlock
                title={'Mémoire'}
                value={memValue}
                maxLabel={limits.memory > 0 ? `${limits.memory} MiB` : undefined}
                color={'#a78bfa'}
            >
                <Line {...memory.props} />
            </ChartBlock>
            <ChartBlock
                title={'Réseau'}
                value={netValue}
                color={'#22d3ee'}
            >
                <Line {...network.props} />
            </ChartBlock>
        </>
    );
};
