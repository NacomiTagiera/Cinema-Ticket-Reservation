import { Genre, PrismaClient } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

async function main() {
	const standardSeatType = await prisma.seatType.create({
		data: {
			name: 'STANDARD',
			price: new Decimal(10.0),
		},
	});

	const vipSeatType = await prisma.seatType.create({
		data: {
			name: 'VIP',
			price: new Decimal(15.0),
		},
	});

	const hall1 = await prisma.hall.create({
		data: {
			name: 'Main Hall',
			rows: 10,
			columns: 12,
		},
	});

	const hall2 = await prisma.hall.create({
		data: {
			name: 'VIP Hall',
			rows: 8,
			columns: 10,
		},
	});

	for (const hall of [hall1, hall2]) {
		for (let row = 1; row <= hall.rows; row++) {
			for (let col = 1; col <= hall.columns; col++) {
				await prisma.seat.create({
					data: {
						row,
						column: col,
						hallId: hall.id,
						seatTypeId: hall.name === 'VIP Hall' && row >= 6 ? vipSeatType.id : standardSeatType.id,
					},
				});
			}
		}
	}

	const movies = [
		{
			title: 'The Shawshank Redemption',
			description:
				'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
			duration: 142,
			genres: [Genre.DRAMA],
			director: 'Frank Darabont',
			actors: 'Tim Robbins, Morgan Freeman, Bob Gunton',
			releaseYear: 1994,
			imageUrl: 'https://placeholder.com/shawshank.jpg',
			trailerUrl: 'https://youtube.com/watch?v=shawshank',
		},
		{
			title: 'Inception',
			description:
				'A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
			duration: 148,
			genres: [Genre.ACTION, Genre.SCIENCE_FICTION, Genre.THRILLER],
			director: 'Christopher Nolan',
			actors: 'Leonardo DiCaprio, Joseph Gordon-Levitt, Ellen Page',
			releaseYear: 2010,
			imageUrl: 'https://placeholder.com/inception.jpg',
			trailerUrl: 'https://youtube.com/watch?v=inception',
		},
		{
			title: 'The Dark Knight',
			description:
				'When the menace known as The Joker emerges, Batman must face one of the greatest psychological and physical tests of his ability to fight injustice.',
			duration: 152,
			genres: [Genre.ACTION, Genre.DRAMA, Genre.THRILLER],
			director: 'Christopher Nolan',
			actors: 'Christian Bale, Heath Ledger, Aaron Eckhart',
			releaseYear: 2008,
			imageUrl: 'https://placeholder.com/darkknight.jpg',
			trailerUrl: 'https://youtube.com/watch?v=darkknight',
		},
		{
			title: 'Pulp Fiction',
			description:
				'The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.',
			duration: 154,
			genres: [Genre.DRAMA, Genre.THRILLER],
			director: 'Quentin Tarantino',
			actors: 'John Travolta, Uma Thurman, Samuel L. Jackson',
			releaseYear: 1994,
			imageUrl: 'https://placeholder.com/pulpfiction.jpg',
			trailerUrl: 'https://youtube.com/watch?v=pulpfiction',
		},
		{
			title: 'The Lord of the Rings: The Return of the King',
			description:
				"Gandalf and Aragorn lead the World of Men against Sauron's army to draw his gaze from Frodo and Sam as they approach Mount Doom with the One Ring.",
			duration: 201,
			genres: [Genre.ADVENTURE, Genre.FANTASY],
			director: 'Peter Jackson',
			actors: 'Elijah Wood, Viggo Mortensen, Ian McKellen',
			releaseYear: 2003,
			imageUrl: 'https://placeholder.com/lotr3.jpg',
			trailerUrl: 'https://youtube.com/watch?v=lotr3',
		},
		{
			title: 'Forrest Gump',
			description:
				'The presidencies of Kennedy and Johnson, the Vietnam War, the Watergate scandal and other historical events unfold from the perspective of an Alabama man.',
			duration: 142,
			genres: [Genre.DRAMA, Genre.ROMANCE],
			director: 'Robert Zemeckis',
			actors: 'Tom Hanks, Robin Wright, Gary Sinise',
			releaseYear: 1994,
			imageUrl: 'https://placeholder.com/forrestgump.jpg',
			trailerUrl: 'https://youtube.com/watch?v=forrestgump',
		},
		{
			title: 'The Matrix',
			description:
				'A computer programmer discovers that reality as he knows it is a simulation created by machines, and joins a rebellion to overthrow them.',
			duration: 136,
			genres: [Genre.ACTION, Genre.SCIENCE_FICTION],
			director: 'Lana and Lilly Wachowski',
			actors: 'Keanu Reeves, Laurence Fishburne, Carrie-Anne Moss',
			releaseYear: 1999,
			imageUrl: 'https://placeholder.com/matrix.jpg',
			trailerUrl: 'https://youtube.com/watch?v=matrix',
		},
		{
			title: 'Goodfellas',
			description:
				'The story of Henry Hill and his life in the mob, covering his relationship with his wife Karen Hill and his mob partners Jimmy Conway and Tommy DeVito.',
			duration: 146,
			genres: [Genre.DRAMA, Genre.THRILLER],
			director: 'Martin Scorsese',
			actors: 'Robert De Niro, Ray Liotta, Joe Pesci',
			releaseYear: 1990,
			imageUrl: 'https://placeholder.com/goodfellas.jpg',
			trailerUrl: 'https://youtube.com/watch?v=goodfellas',
		},
		{
			title: 'The Silence of the Lambs',
			description:
				'A young FBI cadet must receive the help of an incarcerated and manipulative cannibal killer to help catch another serial killer.',
			duration: 118,
			genres: [Genre.DRAMA, Genre.THRILLER, Genre.HORROR],
			director: 'Jonathan Demme',
			actors: 'Jodie Foster, Anthony Hopkins, Scott Glenn',
			releaseYear: 1991,
			imageUrl: 'https://placeholder.com/silenceofthelambs.jpg',
			trailerUrl: 'https://youtube.com/watch?v=silenceofthelambs',
		},
		{
			title: "Schindler's List",
			description:
				'In German-occupied Poland during World War II, industrialist Oskar Schindler gradually becomes concerned for his Jewish workforce after witnessing their persecution by the Nazis.',
			duration: 195,
			genres: [Genre.DRAMA, Genre.HISTORICAL],
			director: 'Steven Spielberg',
			actors: 'Liam Neeson, Ben Kingsley, Ralph Fiennes',
			releaseYear: 1993,
			imageUrl: 'https://placeholder.com/schindlerslist.jpg',
			trailerUrl: 'https://youtube.com/watch?v=schindlerslist',
		},
	];

	for (const movieData of movies) {
		const movie = await prisma.movie.create({
			data: {
				...movieData,
				genres: movieData.genres,
			},
		});

		const startDate = new Date();
		for (let i = 0; i < 5; i++) {
			const screeningStartTime = new Date(startDate);
			screeningStartTime.setDate(startDate.getDate() + i);
			screeningStartTime.setHours(14 + (i % 3) * 3, 0, 0);

			await prisma.screening.create({
				data: {
					movieId: movie.id,
					hallId: i % 2 === 0 ? hall1.id : hall2.id,
					startTime: screeningStartTime,
					endTime: new Date(screeningStartTime.getTime() + movieData.duration * 60000),
				},
			});
		}
	}
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(() => {
		prisma.$disconnect();
	});
