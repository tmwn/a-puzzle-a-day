
export class Problem {
    month: number
    day: number
    field: Matrix<CellKind>
    rest: number
    constructor(month: number, day: number) {
        this.month = month
        this.day = day
        this.field = newBoard(month, day)
        this.rest = 0b11111111
    }
    // put returns whether piece is put, and undo function.
    put(piece: Piece, col: number, row: number, computeOffset: boolean): [boolean, () => void] {
        if ((this.rest >> piece.kind & 1) === 0) {
            return [false, () => { }]
        }

        const h = piece.shape.length
        const w = piece.shape[0].length

        let offY = 0
        if (computeOffset) {
            while (!piece.shape[0][offY]) offY++
        }

        const places = new Array<[number, number]>()
        for (let i = 0; i < h; i++) {
            for (let j = 0; j < w; j++) {
                if (!piece.shape[i][j]) {
                    continue
                }
                if (col + i >= H || row - offY + j < 0 || row - offY + j >= W || this.field[col + i][row - offY + j] !== CellKind.Empty) {
                    return [false, () => { }]
                }
                places.push([i, j])
            }
        }
        for (const [i, j] of places) {
            this.field[col + i][row - offY + j] = piece.kind
        }
        this.rest &= ~(1 << piece.kind)
        return [true, () => {
            this.rest |= 1 << piece.kind
            for (const [i, j] of places) {
                this.field[col + i][row - offY + j] = CellKind.Empty
            }
        }]
    }
    remove(col: number, row: number, target?: CellKind): boolean {
        if (col < 0 || col >= H || row < 0 || row >= W) return false
        const kind = this.field[col][row]
        if (target !== undefined && target !== kind) return false
        if (kind === CellKind.Block || kind === CellKind.Empty) return false
        this.rest |= 1 << kind
        this.field[col][row] = CellKind.Empty
        for (const [di, dj] of [[-1, 0], [0, -1], [0, 1], [1, 0]]) {
            this.remove(col + di, row + dj, kind)
        }
        return true
    }

    clone(): Problem {
        const res = new Problem(this.month, this.day)
        for (let i = 0; i < H; i++)for (let j = 0; j < W; j++)res.field[i][j] = this.field[i][j]
        res.rest = this.rest
        return res
    }
}

export enum CellKind {
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

export interface Piece {
    kind: CellKind,
    shape: Matrix<boolean>
}

export function allPieces(): Array<Array<Piece>> {
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
            p = rotated(p)
        }
        p = flipped(p)
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

export function rotated(piece: Piece): Piece {
    const [h, w] = [piece.shape.length, piece.shape[0].length]
    const res = new Array<Array<boolean>>()
    for (let i = 0; i < w; i++) {
        res.push([])
        for (let j = 0; j < h; j++) {
            res[i].push(piece.shape[h - 1 - j][i])
        }
    }
    return {
        kind: piece.kind,
        shape: res,
    }
}

export function flipped(piece: Piece): Piece {
    const [h, w] = [piece.shape.length, piece.shape[0].length]
    const res = new Array<Array<boolean>>()
    for (let i = 0; i < h; i++) {
        res.push([])
        for (let j = 0; j < w; j++) {
            res[i].push(piece.shape[i][w - 1 - j])
        }
    }
    return {
        kind: piece.kind,
        shape: res,
    }
}

export const H = 7
export const W = 7
const emptyRows = [6, 6, 7, 7, 7, 7, 3]

export type Matrix<T> = Array<Array<T>>

export const newBoard = (month: number, day: number): Matrix<CellKind> => {
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