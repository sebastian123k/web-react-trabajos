const hero = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png'
import Buttons from './Buttons'


export default function Hero() {
return (
<section className="hero">
<div>
<h1>Become a Pokémon Master</h1>
<p>Join the PokéAcademy and start your adventure. Learn everything about Pokémon.</p>
<Buttons />
</div>
<div className="hero-img">
<img src={hero} alt="pokemon" />
</div>
</section>
)
}