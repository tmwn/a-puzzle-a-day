import React, { useEffect, useState } from "react";
import { BoardView } from "./board";
import { Matrix, CellKind, Piece, H, W, allPieces, Problem } from "./data";

export function Solver(props: { problem: Problem }) {
    const { problem } = props
    const [solutions, setSolutions] = useState<Array<Matrix<CellKind>>>([])

    useEffect(() => {
        let cancelled = false

        async function f() {
            const pieces = allPieces()

            const start = performance.now()

            const all = new Array<Matrix<CellKind>>()
            for (let report = 20; !cancelled; report *= 2) {
                const res = new Array<Matrix<CellKind>>()
                dfs(problem, pieces, 0, 0, report, res)
                if (res.length < report) {
                    all.push(...res)
                    break
                }
                setSolutions(res)

                await new Promise((resolve, _) => setTimeout(resolve, 0))

                if (report >= 1000) {
                    console.error("BUG: too many solutions")
                    break
                }
            }
            if (!cancelled) {
                console.log(`computed all in ${performance.now() - start} ms`)
                setSolutions(all.slice())
            }
        }
        f().catch(console.error)

        return () => {
            cancelled = true
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

function dfs(prob: Problem, pieces: Array<Array<Piece>>, x: number, y: number, limit: number, res: Array<Matrix<CellKind>>) {
    while (prob.has(x, y)) {
        y++
        if (y >= W) {
            x++
            y = 0
        }
    }

    for (let k = 0; k < pieces.length; k++) {
        if ((prob.rest >> k & 1) === 0) {
            continue
        }
        for (let j = 0; j < pieces[k].length; j++) {

            if (res.length >= limit) {
                return
            }

            const [ok, undo] = prob.put(pieces[k][j], x, y, true)
            if (!ok) {
                continue
            }

            if (prob.rest === 0) {
                res.push(prob.field())
            } else {
                dfs(prob, pieces, x, y, limit, res)
            }

            undo()
        }
    }
}
