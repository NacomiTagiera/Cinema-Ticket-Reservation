import { HallRepository } from './HallRepository.js';
import { MovieRepository } from './MovieRepository.js';
import { ReservationRepository } from './ReservationRepository.js';
import { ScreeningRepository } from './ScreeningRepository.js';
import { UserRepository } from './UserRepository.js';

export const hallRepository = new HallRepository();
export const movieRepository = new MovieRepository();
export const screeningRepository = new ScreeningRepository();
export const reservationRepository = new ReservationRepository();
export const userRepository = new UserRepository();
