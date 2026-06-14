import dayjs from "dayjs";
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/es';

dayjs.extend(relativeTime);
dayjs.locale('es');

export const formatRelativeDate = (date) => {
    return dayjs(date).fromNow()
}

export const formatBanDate = (date) => {
    return date ? dayjs(date).format('DD-MM-YYYY') : '-'
}