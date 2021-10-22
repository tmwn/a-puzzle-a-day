import React, { CSSProperties, useEffect, useState } from "react";

export function Solver(props: { month: number, day: number }) {
    const { month, day } = props
    const [solutions, setSolutions] = useState<Array<Matrix<CellKind>>>([newBoard(month, day)])
    // const [id, setID] = useState(0)

    useEffect(() => {
        const field = newBoard(month, day)
        const pieces = allPieces()

        const all = dfs(field, pieces, 0b11111111, 0, 0)
        setSolutions(all)
    }, [month, day])

    const res = solutions.map((board, i) => <BoardView key={i} board={board} style={{ margin: 2, display: "inline-block" }} />)

    return <>
        <div className="pure-u-1-5"></div>
        <div className="pure-u-3-5">
            <p className="pure-u">{solutions.length} solutions found</p>
            <div>
                {res}
            </div>
        </div>
        <div className="pure-u-1-5"></div>
    </>
}

// function Selector(props: { total: number, onChange: (id: number) => void }) {
//     const { total, onChange } = props
//     const res = []
//     for (let i = 0; i < total; i++) {
//         res.push(<a className="pure-button" key={i} href="#" onClick={(_) => onChange(i)} >{i}</a >)
//     }
//     return <>
//         <div className="pure-u-1-4" />
//         <div className="pure-u-2-4">
//             {res}
//         </div>
//     </>
// }

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

function dfs(field: Matrix<CellKind>, pieces: Array<Array<Piece>>, rest: number, x: number, y: number): Array<Matrix<CellKind>> {
    if (rest === 0) {
        return [clone(field)]
    }
    if (y >= W) {
        return dfs(field, pieces, rest, x + 1, 0)
    }
    if (field[x][y] !== CellKind.Empty) {
        return dfs(field, pieces, rest, x, y + 1)
    }
    const res = new Array<Matrix<CellKind>>()
    for (let k = 0; k < pieces.length; k++) {
        if ((rest >> k & 1) === 0) {
            continue
        }
        for (const p of pieces[k]) {
            const [ok, undo] = put(p, field, x, y)
            if (!ok) {
                continue
            }
            res.push(...dfs(field, pieces, rest & ~(1 << k), x, y + 1))
            undo()
        }
    }
    return res
}

enum CellKind {
    Empty = -1,
    PieceO = 0,
    PieceL,
    PieceN,
    PieceP,
    PieceU,
    PieceV,
    PieceY,
    PieceZ,
    Block,
}

interface Piece {
    kind: CellKind,
    shape: Matrix<boolean>
}

function allPieces(): Array<Array<Piece>> {
    const decode = (kind: CellKind, encoded: Array<string>): Piece => {
        const shape = new Array<Array<boolean>>()
        const [h, w] = [encoded.length, encoded[0].length]
        for (let i = 0; i < h; i++) {
            shape.push([])
            for (let j = 0; j < w; j++)shape[i].push(encoded[i][j] === '1')
        }
        return { kind: kind, shape: shape }
    }
    const data: Array<[CellKind, Array<string>]> = [
        [CellKind.PieceO, ["111", "111"]],
        [CellKind.PieceL, ["1111", "0001"]],
        [CellKind.PieceN, ["1110", "0011"]],
        [CellKind.PieceP, ["111", "011"]],
        [CellKind.PieceU, ["111", "101"]],
        [CellKind.PieceV, ["111", "001", "001"]],
        [CellKind.PieceY, ["1111", "0100"]],
        [CellKind.PieceZ, ["100", "111", "001"]],
    ]
    return data.map(([kind, encoded]) => allOrientaion(decode(kind, encoded)))
}

function allOrientaion(initial: Piece): Array<Piece> {
    const res = new Array<Piece>()
    let p = initial
    for (let j = 0; j < 2; j++) {
        for (let i = 0; i < 4; i++) {
            let dup = false
            for (const x of res) {
                if (sameShape(x.shape, p.shape)) {
                    dup = true
                    break
                }
            }
            if (!dup) {
                res.push(p)
            }
            p = { kind: p.kind, shape: rotated(p.shape) }
        }
        p = { kind: p.kind, shape: flipped(p.shape) }
    }
    return res
}

function sameShape(shape1: Matrix<boolean>, shape2: Matrix<boolean>): boolean {
    if (shape1.length !== shape2.length) return false
    const [h, w] = [shape1.length, shape1[0].length]
    for (let i = 0; i < h; i++) {
        for (let j = 0; j < w; j++) {
            if (shape1[i][j] !== shape2[i][j]) return false
        }
    }
    return true
}

function rotated(shape: Matrix<boolean>): Matrix<boolean> {
    const [h, w] = [shape.length, shape[0].length]
    const res = new Array<Array<boolean>>()
    for (let i = 0; i < w; i++) {
        res.push([])
        for (let j = 0; j < h; j++) {
            res[i].push(shape[j][w - 1 - i])
        }
    }
    return res
}

function flipped(shape: Matrix<boolean>): Matrix<boolean> {
    const [h, w] = [shape.length, shape[0].length]
    const res = new Array<Array<boolean>>()
    for (let i = 0; i < h; i++) {
        res.push([])
        for (let j = 0; j < w; j++) {
            res[i].push(shape[i][w - 1 - j])
        }
    }
    return res
}

// put returns whether piece is put, and undo function.
function put(piece: Piece, board: Matrix<CellKind>, x: number, y: number): [boolean, () => void] {
    const h = piece.shape.length
    const w = piece.shape[0].length

    let offY = 0
    while (!piece.shape[0][offY]) offY++

    const places = new Array<[number, number]>()
    for (let i = 0; i < h; i++) {
        for (let j = 0; j < w; j++) {
            if (!piece.shape[i][j]) {
                continue
            }
            if (x + i >= H || y - offY + j < 0 || y - offY + j >= W || board[x + i][y - offY + j] !== CellKind.Empty) {
                return [false, () => { }]
            }
            places.push([i, j])
        }
    }
    for (const [i, j] of places) {
        board[x + i][y - offY + j] = piece.kind
    }
    return [true, () => {
        for (const [i, j] of places) {
            board[x + i][y - offY + j] = CellKind.Empty
        }
    }]
}

const H = 7
const W = 7
const emptyRows = [6, 6, 7, 7, 7, 7, 3]

type Matrix<T> = Array<Array<T>>

const newBoard = (month: number, day: number): Matrix<CellKind> => {
    const res: Matrix<CellKind> = []
    for (let i = 0; i < H; i++) {
        res.push([])
        for (let j = 0; j < W; j++) {
            res[i].push(j < emptyRows[i] ? CellKind.Empty : CellKind.Block)
        }
    }
    res[Math.floor((month - 1) / 6)][(month - 1) % 6] = CellKind.Block
    res[Math.floor(2 + (day - 1) / 7)][(day - 1) % 7] = CellKind.Block
    return res
}

function color(x: CellKind) {
    switch (x) {
        case CellKind.Empty:
            return "lightgray"
        case CellKind.PieceO:
            return "pink"
        case CellKind.PieceL:
            return "#cc0000"
        case CellKind.PieceN:
            return "cyan"
        case CellKind.PieceP:
            return "#0000"
        case CellKind.PieceU:
            return "green"
        case CellKind.PieceV:
            return "#cc00cc"
        case CellKind.PieceY:
            return "orange"
        case CellKind.PieceZ:
            return "gray"
        case CellKind.Block:
            return "black"
    }
}

function BoardView(props: { board: Matrix<CellKind>, style: CSSProperties }) {
    const { board, style } = props

    const N = 30
    const res = []
    for (let i = 0; i < H; i++) {
        const row = []
        for (let j = 0; j < W; j++) {
            const c = color(board[i][j])
            row.push(<span key={j} style={{ width: N, height: N, backgroundColor: c, display: "inline-block" }} />)
        }
        res.push(<div key={i} style={{ height: N }}>
            {row}
        </div>)
    }
    return <>
        <div style={style}>
            {res}
        </div>
    </>
}
