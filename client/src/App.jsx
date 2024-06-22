import React, { useState } from "react"
import axios from "axios"
import { BrowserRouter as Router, Route, Link, Routes } from "react-router-dom"
import History from "./Components/History"
import "./App.css"
import QuizGenerator from "./Components/QuizGenerator"

const App = () => {
    const [responseText, setResponseText] = useState("")

    const handleGenerateQuiz = async () => {
        const payload = {
            content: `World War I[j] or the First World War (28 July 1914 – 11 November 1918) was a global conflict between two coalitions: the Allies (or Entente) and the Central Powers. Fighting took place mainly in Europe and the Middle East, as well as parts of Africa and the Asia-Pacific, and was characterised by trench warfare and the use of artillery, machine guns, and chemical weapons (gas). World War I was one of the deadliest conflicts in history, resulting in an estimated 9 million military dead and 23 million wounded, plus up to 8 million civilian deaths from causes including genocide. The movement of large numbers of troops and civilians was a major factor in spreading the Spanish flu pandemic. The causes of World War I included the rise of Germany and decline of the Ottoman Empire, which disturbed the balance of power in place in Europe for most of the 19th century, as well as increased economic competition between nations triggered by new waves of industrialisation and imperialism. Growing tensions between the great powers and in the Balkans reached a breaking point on 28 June 1914, when a Bosnian Serb named Gavrilo Princip assassinated Archduke Franz Ferdinand, heir to the Austro-Hungarian throne. Austria-Hungary held Serbia responsible, and declared war on 28 July. Russia mobilised in Serbias defence, and by 4 August, Germany, Russia, France, and the United Kingdom were drawn into the war, with the Ottomans joining in November of the same year. Germanys strategy in 1914 was to quickly defeat France, then to transfer its forces to the Russian front. However, this failed, and by the end of the year the Western Front consisted of a continuous line of trenches stretching from the English Channel to Switzerland. The Eastern Front was more dynamic, but neither side could gain a decisive advantage, despite costly offensives. As the fighting expanded to more fronts, Italy, Bulgaria, Romania, Greece and others joined in from 1915 onward. In April 1917, the United States entered the war on the Allied side following Germanys resumption of unrestricted submarine warfare against Atlantic shipping; later that year, the Bolsheviks seized power in the Russian October Revolution, after which Soviet Russia signed an armistice with the Central Powers in December, followed by a separate peace in March 1918. That month, Germany`,
            options: "5,medium,all",
        }

        try {
            const response = await axios.post(
                "http://localhost:3000/generate-quiz",
                payload,
            ) // Replace with your server endpoint
            setResponseText(JSON.stringify(response.data, null, 2))
        } catch (error) {
            console.error("Error fetching data:", error)
            setResponseText("An error occurred while fetching data.")
        }
    }

    return (
        <Router>
            <div className="flex w-screen divide-x divide-white/10">
                <History />
                <Routes>
                    <Route
                        path="/"
                        element={
                            <QuizGenerator
                                handleClick={handleGenerateQuiz}
                                responseText={responseText}
                            />
                        }
                    />
                </Routes>
            </div>
        </Router>
    )
}

export default App
