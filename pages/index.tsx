import { Modal, TextInput, Button, Group, createStyles, Text, Image, Badge, Divider, NumberInput } from '@mantine/core';
import { KeyboardEvent, useState } from 'react';
import { useListState } from '@mantine/hooks';
import { ColorSchemeToggle } from '../components/ColorSchemeToggle/ColorSchemeToggle';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

declare module response {
	export interface Title {
		romaji: string;
		english: string;
	}

	export interface CoverImage {
		medium: string;
	}

	export interface Media {
		id: Number;
		title: Title;
		coverImage: CoverImage;
		meanScore: number;
	}

	export interface Entry {
		repeat: number;
		score: number;
		media: Media;
		pinned: boolean;
	}

	export interface List {
		name: string;
		entries: Entry[];
	}

	export interface MediaListCollection {
		lists: List[];
	}

	export interface Data {
		MediaListCollection: MediaListCollection;
	}

	export interface RootObject {
		data: Data;
	}
}

declare module customdata {
	export interface CustomEntryInfo {
		id: Number;
		pinned: boolean;
		score: number;
		temp: {
			properposition: boolean;
		};
	}
}

const useStyles = createStyles((theme) => ({
	item: {
		...theme.fn.focusStyles(),
		display: 'flex',
		alignItems: 'center',
		borderRadius: theme.radius.md,
		border: `1px solid ${theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[2]}`,
		padding: `${theme.spacing.sm}px ${theme.spacing.xl}px`,
		backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.white,
		marginBottom: theme.spacing.sm,
		userSelect: 'none'
	},

	itemDragging: {
		boxShadow: theme.shadows.sm
	},

	symbol: {
		fontSize: 30,
		fontWeight: 700,
		width: 60
	}
}));

export default function HomePage() {
	const { classes, cx } = useStyles();
	const [opened, setOpened] = useState(true);
	const [disabled, setDisabled] = useState(false);
	const [username, setUsername] = useState('');
	const [entries, setEntries] = useListState<response.Entry>();

	function fetchData() {
		setDisabled(true);
		const query = `
    {
      MediaListCollection(userName: "${username}", type: MANGA) {
        lists {
          name
          entries {
            repeat
            score
            media {
              id
              title {
                romaji
                english
              }
              coverImage {
                medium
              }
              meanScore
            }
          }
        }
      }
    }
    `;

		const url = 'https://graphql.anilist.co';
		const options = {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json'
			},
			body: JSON.stringify({
				query: query
			})
		};

		fetch(url, options)
			.then((res) => res.json())
			.then((res) => handleData(res))
			.finally(() => setDisabled(false));
	}

	function handleData(data: response.RootObject) {
		setOpened(false);
		const { lists } = data.data.MediaListCollection;
		const completed = lists.find((list) => list.name === 'Completed');

		setEntries.setState(completed?.entries!.sort((a, b) => b.score - a.score)!);
	}

	const emptyPin =
		'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAABmJLR0QA/wD/AP+gvaeTAAAEHklEQVRogdXae4hVVRTH8c9Mr0EJnBnH0YgKehk9qDSjF/RXkiARSRFIWCZFTQ/L0gnCKAL/KgwypP6M+iOCQAp7UdEDy6wsmworKinDSqaXmo1z+2Pvyz5z504z555z7+gXDszd5+y1f+ucvddZe53h4KAN92AndmH55MppnEdQqTnun1RFDXCFIHwP5mMxhmJb/yTqykUvfhZE92Xar5GcuW8SdOWiDS8KYjfG31mW4EA8v6q10vJxtyByF2aOcc31kjP3tkhXLs7AXgxj4TjX3iA4M4zbmqwrFx34VLjLj0+wz1LJmVubpCs3TwhODGBKjn7LBEeGcUsTdOXi8ihkP85roH/WmZtL1JWLbKhdUcDOHdHGMG4qQVcusqH2LRxW0N6d0dYBXFfQVl2OwZmYg9PRHdvvigP/hmNLGmtFtDmEq4oa6xUW3kbsNjpfqgjT6Z/496KiA9awMtr9plEDx2O9JLB67MZHeBOb8EPm3FOFJNfnomj7+7wd23E7/pIEvi0suhPG6DMdFyi+LmpZgsGo4eE8HTvwnOTAO5hXsriJ0IsXMjqewRF5DFSjzn4hatQmea1gEX6JOgaFp5Kbd6OBr9BTmrSJ0SXc+epTeBXHNWqsB1ujoS+MnbGWzXzskDZfK4W1WohOfKg1zkzBWuENXsF7OKXMATqxWXJmVpnGIxdiexxjr/AUyo56aJ4zHVgjbaa24uySbI9JNz6OA36GGQXtzRRuSjUyrpYzrBahW3iTV7BNMWcWSCnNucWl5WcaPlB8mvVGGz+WpKshHpJi/LYoqhF2RhtdJenKxQJhcQ7ha8Wc2RL7n1qauglyopS+rxISxE/i78/ld2ZT7Du3RI3jMlV60z8v5V7ZaJbXmWp15bTyZI5PNfcZwNE157qkF9pEnWnDH7FPy3K55XHA3zG75lw7HpBeahN15iQp/LaES/GvkANdWXNuGjZIe+nV0nQZ8P/O9MXrNpSsty6z8JP6u7LZgtgKfsVlsT2baH4pFCjqUU15lpYreTRHSVHlZSOTuKvxZzy3xeht73QpMAwYnTVfIqXp3ZrMk3Gw76IwgjNrpFT7aWOXQbOJZvbJtOP92L62GcKzLJPu2DmxrQevS0leX/2uI8iG5uqT6Ze2rmNNu1KYh31xsGpVb45QgqkIacXFOexlE81vhcBRwY0l6a3LDGmb+VhsW4y/Y9tmje2ds4lmBc9qYjHjcLwhlX6mYl1m8HU4soD9LrwmlJiK2BmXR6WpM1eqouzT5GlQJtdKi7hfenfswPmTqCsXZ0kl0QHBmYoQoVpdz2qYTinZyx7rtXD/XJR2qSxaPfZo0oeUZvKgkU5sFz7aHFIsNDLtfkmYZocUJ0vfGYaF3KlwbXUyqCZsg8b/L4SDmlcEZ0otELea/wDwckuXpmvSUAAAAABJRU5ErkJggg==';
	const filledPin =
		'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAABmJLR0QA/wD/AP+gvaeTAAACt0lEQVRogdWZO2gUURSGv6zrGwSLrEpUTEArBQXRTgQbRWMpVjYRFF+IgoqPxipVQDBFGovEViw0jaBgFAQfTdqghRZKkBiNJLuKuxZnRiezM7NzH3Pv7geHZXfZuf+3O3Pn3rPQHpSAG8BnYBq44DeOPneARqxueU2kwSGgTrNIA7jpMZcSFeALyRJhXfeWLiddwDjZEmFd85QxF5fIJxHWFT8xs9kOLKAmUgfO+wibxgpgEjWJqMxZ95GTuYueRFTmjPPUMQ6SPtWqypx2nP0fFeTObSoRlTnl1ACZah8ZBk+qP8AJgLLFsGVgC7AeuaDnga/Ae+QCPWJxrJAScA+YMz1QDzK/TwBVkr+1KlBLec9WfdAV6AVGgV8FB8xbM6oCXcBl5LTxHT5agyoSK4GHbRA6XmPAEhWRvAs8V/WNYMZS5UUbhA/rCbBJRwKgG/01kq2aB64i064RPmVeAdtMBXzKLCC/gtIF3W4yk8DOIgRcyfxG7g3LipYoUmYG2O1KIIptmZ9YmJV0sS3T5za+sCZ4tCmz1118oQ/Z9fUHz23JHHBmgCwi3wUD14Cjwes2ZPa4kgC4Hxu8ChwO3jOV6XUlcTElQA3z0+wHjmatfWTvDKtI20dX5qkLiR5ad88bwCdgtabMuaIlliMr0FZB3gKbY5/NK1NF+l+FMpIjyBiwKuXzeWSGi4svDLQIUCNfPzZL5juw0XbwKLvI7ppMA/sVjpcmc9Je5GYqwMeEQcN6CWzQOG5cZhRpNRVCGXhGusQwZvuFbuSLeGB4nJYMkT6zDBQ5sE2Ok35/cLoOMmEHsrmJSzwH1nnMpcRaYIpmiRFgqcdcSpSAxywWmAOO+Qylw20WS0whp1lH0Y/8jRVKjCOnWUexFZhFBOpIP8lbF8OE14jELP83RR3JBPAGyw1i1/wFmXdMxk3vHmcAAAAASUVORK5CYII=';

	function pinClick(e: any, entry: response.Entry) {
		let listEntry = entries.find((i) => i.media.id == entry.media.id)!;
		listEntry.pinned = !listEntry.pinned;
		e.target.src = listEntry.pinned ? filledPin : emptyPin;

		setEntries.setItem(
			entries.findIndex((i) => i.media.id == entry.media.id),
			listEntry
		);
	}

	function scoreKeyUp(k: KeyboardEvent<HTMLInputElement>) {
		// Alt is set to ID
		let id = (k.target as any).alt as Number;
		let entry = entries.find((item) => item.media.id == id)!;
		entry.score = parseFloat((k.target as any).value);

		setEntries.setItem(
			entries.findIndex((i) => i.media.id == entry.media.id),
			entry
		);
	}

	function generateScores() {
		let pinnedItems = entries.filter((e) => e.pinned);

		let previousPinned = { ...entries[0], position: 0 }; // assume top score is the highest scoring / must stay at the top
		let finalEntries = entries;
		let position = 0;
		entries.forEach((entry) => {
			if (position == 0) {
				position++;
				return;
			} // nothing to be done with this?

			if (pinnedItems.find((item) => item.media.id == entry.media.id)) {
				let scoreMax = previousPinned.score;
				let scoreMin = entry.score;
				let scoresNeeded = position - previousPinned.position + 1; // num gen always includes min and max, aka prev pinned and next pinned

				let scores = genNums(scoreMin, scoreMax, scoresNeeded);

				for (let i = 0; i < scores.length - 1; i++) {
					let e = entries[position - i];
					e.score = scores[i];
					finalEntries[position - i] = e;
				}

				previousPinned = { ...entry, position: position };
			}

			position++;
		});

		setEntries.setState(finalEntries);

		function genNums(min: number, max: number, count: number): number[] {
			const step = (max - min) / (count - 1);
			const numbers: number[] = [];
			for (let i = 0; i < count; i++) {
				numbers.push(Math.round((min + i * step) * 2) / 2); // converts 5.3 to 5.5 for example
			}
			return numbers;
		}
	}

	let items = entries.map((item, index) => (
		<Draggable key={String(item.media.id)} index={index} draggableId={String(item.media.id)}>
			{(provided, snapshot) => (
				<div
					className={cx(classes.item, { [classes.itemDragging]: snapshot.isDragging })}
					{...provided.draggableProps}
					{...provided.dragHandleProps}
					ref={provided.innerRef}
				>
					<Group>
						<Image width={16} src={emptyPin} onClick={(e) => pinClick(e, item)} />
						<div style={{ width: 50 }}>
							<Image src={item.media.coverImage.medium} width={'80%'} />
						</div>
						<Group>
							<h3>{item.media.title.romaji}</h3>
							<Badge>{item.repeat}</Badge>
						</Group>
						<Divider size="lg" label={item.score} labelPosition="right" />

						{/* Line not rendering? */}
					</Group>
					<div
						style={{
							marginLeft: 'auto',
							marginRight: 0,
							display: 'block'
						}}
					>
						<NumberInput
							alt={item.media.id + ''}
							defaultValue={item.score}
							placeholder="Score"
							onKeyUpCapture={(k) => scoreKeyUp(k)}
							min={0}
							max={10}
							step={0.5}
							precision={1}
						/>
					</div>
				</div>
			)}
		</Draggable>
	));

	return (
		<>
			<Modal opened={opened} onClose={() => null} title="Get user data">
				<TextInput placeholder="Username" onChange={(e) => setUsername(e.target.value)} required />
				<Group position="right" mt="md">
					<Button disabled={disabled} onClick={() => fetchData()}>
						Fetch
					</Button>
				</Group>
				<Text>
					Note: This code is *very* fragile. To ensure it doesn't crash, pin at least two scores, with the top
					most item being pinned. Anything below the lowest pin will not be assigned a score. Once scores have
					been generated, move around one of the entries to get the scores to update.
				</Text>
			</Modal>

			<Button onClick={() => generateScores()}>Generate</Button>

			<DragDropContext
				onDragEnd={({ destination, source }) =>
					setEntries.reorder({ from: source.index, to: destination?.index! })
				}
			>
				<Droppable droppableId="dnd-list" direction="vertical">
					{(provided) => (
						<div {...provided.droppableProps} ref={provided.innerRef}>
							{items}
							{provided.placeholder}
						</div>
					)}
				</Droppable>
			</DragDropContext>

			<ColorSchemeToggle />
		</>
	);
}
