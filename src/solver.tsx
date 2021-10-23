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

            const all = new Array<Matrix<CellKind>>()
            let report = 10
            for (const x of dfs(problem, pieces, 0, 0, () => { return cancelled })) {
                if (cancelled) break
                all.push(x)
                if (all.length === report) {
                    report *= 2
                    setSolutions(all.slice())
                    await new Promise((resolve) => setTimeout(resolve, 0))
                }
            }
            if (!cancelled) {
                setSolutions(all.slice())
            }
        }
        f().catch(console.log)

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

function clone(field: Matrix<CellKind>): Matrix<CellKind> {
    const res = new Array<Array<CellKind>>()
    for (let i = 0; i < H; i++) {
        res.push([])
        for (let j = 0; j < W; j++) {
            res[i].push(field[i][j])
        }
    }
    return res
}

function* dfs(prob: Problem, pieces: Array<Array<Piece>>, x: number, y: number, cancelled: () => boolean): Generator<Matrix<CellKind>> {
    if (cancelled()) {
        return
    }
    if (prob.rest === 0) {
        yield clone(prob.field)
        return
    }
    if (y >= W) {
        yield* dfs(prob, pieces, x + 1, 0, cancelled)
        return
    }
    if (prob.field[x][y] !== CellKind.Empty) {
        yield* dfs(prob, pieces, x, y + 1, cancelled)
        return
    }
    for (let k = 0; k < pieces.length; k++) {
        if ((prob.rest >> k & 1) === 0) {
            continue
        }
        for (const p of pieces[k]) {
            const [ok, undo] = prob.put(p, x, y, true)
            if (!ok) {
                continue
            }
            yield* dfs(prob, pieces, x, y + 1, cancelled)
            undo()
        }
    }
}
