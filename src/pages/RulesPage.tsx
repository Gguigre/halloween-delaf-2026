import './RulesPage.css'

export function RulesPage() {
  return (
    <div>
      <h1 className="center">📜 Les règles</h1>

      <p>
        Des fantômes en papier sont cachés dans le service. Chacun porte un QR code : scanne-le
        avec ton téléphone, et ça compte.
      </p>

      <table className="rules-table">
        <thead>
          <tr>
            <th>Fantôme</th>
            <th>Ce qu'il fait</th>
            <th>Points</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>👻 Blanc</td>
            <td>Rien à faire, le scan suffit</td>
            <td className="gain">+10</td>
          </tr>
          <tr>
            <td>❓ Quiz</td>
            <td>Une énigme, un seul essai</td>
            <td>
              <span className="gain">+20</span> / <span className="loss">−10</span>
            </td>
          </tr>
          <tr>
            <td>🃏 Joker</td>
            <td>Un mini-jeu chronométré</td>
            <td>
              <span className="gain">+50</span> / <span className="loss">−30</span>
            </td>
          </tr>
        </tbody>
      </table>

      <div className="card">
        <h2>Le pari</h2>
        <p>
          Les fantômes blancs ne coûtent jamais rien. Les quiz et les jokers, eux, sont des
          prises de risque : c'est ce qui permet de remonter de plusieurs places d'un coup.
        </p>
        <p className="muted">
          Personne ne t'oblige à tenter. Mais personne ne gagne en ne tentant jamais.
        </p>
      </div>

      <div className="card">
        <h2>À savoir avant de tenter</h2>
        <ul>
          <li>
            <strong>Un seul essai</strong> par quiz et par joker. Pas de seconde chance.
          </li>
          <li>
            Un joker <strong>lancé puis abandonné compte comme perdu</strong>. Tu peux scanner
            un joker et repartir sans rien perdre : c'est le lancement qui engage, pas le scan.
          </li>
          <li>
            Ton score <strong>peut devenir négatif</strong>. Ce n'est pas un bug, c'est le jeu —
            et ça se rattrape avec un seul joker réussi.
          </li>
        </ul>
      </div>

      <div className="card card-warning">
        <h2>Ta promesse</h2>
        <p>
          On ne décroche pas les fantômes, on ne les déplace pas, on ne les cache pas pour
          embêter les autres.
        </p>
        <p className="muted">
          Un fantôme disparu, ce sont des points devenus inatteignables pour tout le service.
        </p>
      </div>
    </div>
  )
}
