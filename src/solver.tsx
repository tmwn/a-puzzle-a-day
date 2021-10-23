import React, { useEffect, useState } from "react";
import { BoardView } from "./board";
import { Matrix, CellKind, Problem } from "./data";

export function Solver(props: { problem: Problem }) {
    const { problem } = props
    const [solutions, setSolutions] = useState<Array<Matrix<CellKind>>>([])

    useEffect(() => {
        const start = performance.now()

        const worker = new Worker(new URL('./search.worker', import.meta.url));
        worker.postMessage(problem)
        worker.onmessage = ({ data: solutions }) => {
            console.log(`Solutions found in ${(performance.now() - start).toFixed(2)} ms.`)
            setSolutions(solutions)
        }
        return () => {
            console.log('Cancelled')
            worker.terminate()
        }
    }, [problem])

    const res = solutions.map((board, i) => <BoardView key={i} board={board} style={{ margin: 2, display: "inline-block" }} />)

    return <div>
        <p>{solutions.length} solution{solutions.length === 1 ? "" : "s"} found</p>
        <div>
            {res}
        </div>
    </div>
}
