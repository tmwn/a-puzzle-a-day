import React, { CSSProperties, useEffect, useState } from "react";
import { BoardView } from "./board";
import { Matrix, CellKind, newBoard, Piece, H, W, allPieces, Problem } from "./data";
import { Editor } from "./editor";

export function Main(props: { problem: Problem, onChange: (problem: Problem) => void }) {
    const { problem, onChange } = props
    return <div className="pure-g">
        <div className="pure-u-1-2">
            <Editor problem={problem} onChange={onChange} />
        </div>
        <div className="pure-u-1-2">
            <Solver problem={problem} />
        </div>
    </div>
}

function Solver(props: { problem: Problem }) {
    const { problem } = props
    const [solutions, setSolutions] = useState<Array<Matrix<CellKind>>>([])

    useEffect(() => {
        const pieces = allPieces()

        const all = dfs(problem, pieces, 0, 0)
        setSolutions(all)
    }, [problem])

    const res = solutions.map((board, i) => <BoardView key={i} board={board} style={{ margin: 2, display: "inline-block" }} />)

    return <div>
        <p>{solutions.length} solutions found</p>
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

function dfs(prob: Problem, pieces: Array<Array<Piece>>, x: number, y: number): Array<Matrix<CellKind>> {
    if (prob.rest === 0) {
        return [clone(prob.field)]
    }
    if (y >= W) {
        return dfs(prob, pieces, x + 1, 0)
    }
    if (prob.field[x][y] !== CellKind.Empty) {
        return dfs(prob, pieces, x, y + 1)
    }
    const res = new Array<Matrix<CellKind>>()
    for (let k = 0; k < pieces.length; k++) {
        if ((prob.rest >> k & 1) === 0) {
            continue
        }
        for (const p of pieces[k]) {
            const [ok, undo] = prob.put(p, x, y, true)
            if (!ok) {
                continue
            }
            res.push(...dfs(prob, pieces, x, y + 1))
            undo()
        }
    }
    return res
}