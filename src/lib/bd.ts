const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

export const birthdayPrettifier = (d: number, m: number) => {
    return `${d.toString()} ${months[m - 1]}`
}