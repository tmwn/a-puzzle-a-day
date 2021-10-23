
export class Problem {
    month: number
    day: number
    // field: Matrix<CellKind>
    masks: Array<number>
    rest: number
    location: Array<[number, number, Piece] | null>
    constructor(month: number, day: number) {
        this.month = month
        this.day = day
        const field = newBoard(month, day)
        this.rest = 0b11111111
        this.masks = new Array(H).fill(0)
        this.location = new Array(8).fill(null)
        for (let i = 0; i < H; i++)for (let j = 0; j < W; j++)this.masks[i] |= (field[i][j] === CellKind.Block ? 1 : 0) << j
    }
    // put returns whether piece is put, and undo function.
    put(piece: Piece, col: number, row: number, computeOffset: boolean): [boolean, () => void] {
        const fail: [boolean, () => void] = [false, () => { }]
        if ((this.rest >> piece.kind & 1) === 0) {
            return fail
        }

        const h = piece.shape.height()
        const w = piece.shape.width()

        if (computeOffset) {
            let offY = 0
            while (!piece.shape.at(0, offY)) offY++
            row -= offY
            if (row < 0) return fail
        }
        if (col + h > H || row + w > W) return fail

        for (let i = 0; i < h; i++) {
            if (((this.masks[col + i] >> row) & piece.shape.rows[i]) !== 0) {
                return fail
            }
        }
        for (let i = 0; i < h; i++) {
            this.masks[col + i] |= piece.shape.rows[i] << row
            this.location[piece.kind] = [col, row, piece]
        }
        this.rest &= ~(1 << piece.kind)
        return [true, () => {
            this.rest |= 1 << piece.kind
            this.location[piece.kind] = null
            for (let i = 0; i < h; i++) {
                this.masks[col + i] &= ~(piece.shape.rows[i] << row)
            }
        }]
    }
    private _remove(col: number, row: number, target: CellKind) {
        if (col < 0 || col >= H || row < 0 || row >= W) return
        const kind = this.kind(col, row)
        if (target !== kind) return
        this.masks[col] &= ~(1 << row)
        for (const [di, dj] of [[-1, 0], [0, -1], [0, 1], [1, 0]]) {
            this._remove(col + di, row + dj, kind)
        }
    }
    remove(col: number, row: number): boolean {
        const kind = this.kind(col, row)
        if (kind === CellKind.Block || kind === CellKind.Empty) return false
        this._remove(col, row, kind)
        this.rest |= 1 << kind
        this.location[kind] = null
        return true
    }
    kind(col: number, row: number): CellKind {
        if ((this.masks[col] >> row & 1) === 0) return CellKind.Empty
        for (let k = 0; k < 8; k++) {
            if (this.contains(k, col, row)) return k
        }
        return CellKind.Block
    }
    private contains(k: number, col: number, row: number): boolean {
        if (!this.location[k]) return false
        const [x, y, p] = this.location[k]!
        const [i, j] = [col - x, row - y]
        if (i < 0 || i >= p.shape.height() || j < 0 || j >= p.shape.width()) return false
        return p.shape.at(i, j) === 1
    }
    has(x: number, y: number): boolean {
        return (this.masks[x] >> y & 1) === 1
    }
    field(): Matrix<CellKind> {
        const res = new Array<Array<CellKind>>()
        for (let i = 0; i < H; i++) {
            res.push([])
            for (let j = 0; j < W; j++) {
                res[i].push(this.has(i, j) ? CellKind.Block : CellKind.Empty)
            }
        }
        for (let k = 0; k < 8; k++) {
            if (!this.location[k]) continue
            const [x, y, p] = this.location[k]!
            for (let i = 0; i < p.shape.height(); i++) for (let j = 0; j < p.shape.width(); j++) {
                if (this.contains(k, x + i, y + j)) res[x + i][y + j] = k
            }
        }
        return res
    }

    clone(): Problem {
        const res = new Problem(this.month, this.day)
        for (let i = 0; i < H; i++) res.masks[i] = this.masks[i]
        for (let i = 0; i < 8; i++) res.location[i] = this.location[i]
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
    shape: Shape,
}

class Shape {
    rows: Array<number>
    private w: number
    constructor(rows: Array<number>, w: number) {
        this.rows = rows
        this.w = w
    }
    height() {
        return this.rows.length
    }
    width() {
        return this.w
    }

    at(i: number, j: number): number {
        return (this.rows[i]) >> j & 1
    }
    rotated(): Shape {
        const [h, w] = [this.rows.length, this.w]
        const rows = new Array<number>()
        for (let i = 0; i < w; i++) {
            let row = 0
            for (let j = 0; j < h; j++) {
                row |= this.at(h - 1 - j, i) << j
            }
            rows.push(row)
        }
        return new Shape(rows, h)
    }
    flipped(): Shape {
        const [h, w] = [this.rows.length, this.w]
        const rows = new Array<number>()
        for (let i = 0; i < h; i++) {
            let row = 0
            for (let j = 0; j < w; j++) {
                row |= this.at(i, w - 1 - j) << j
            }
            rows.push(row)
        }
        return new Shape(rows, w)
    }
    equals(other: Shape): boolean {
        if (this.w != other.w) return false
        for (let i = 0; i < this.rows.length; i++) if (this.rows[i] != other.rows[i]) return false
        return true
    }
}

export function allPieces(): Array<Array<Piece>> {
    const decode = (kind: CellKind, encoded: Array<string>): Piece => {
        const masks = new Array<number>()
        const [h, w] = [encoded.length, encoded[0].length]
        for (let i = 0; i < h; i++) {
            let mask = 0
            for (let j = 0; j < w; j++)mask |= (encoded[i][j] === '1' ? 1 : 0) << j
            masks.push(mask)
        }
        return { kind: kind, shape: new Shape(masks, w) }
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
                if (x.shape.equals(p.shape)) {
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
    return {
        kind: piece.kind,
        shape: piece.shape.rotated(),
    }
}

export function flipped(piece: Piece): Piece {
    return {
        kind: piece.kind,
        shape: piece.shape.flipped(),
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